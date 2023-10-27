const schedule = require("node-schedule");
const locationDao = require("../models/locationDao");
const { GoogleMapsClient, GeoCalculator } = require("./helpers");

const googleMapsClient = new GoogleMapsClient();
const geoCalculator = new GeoCalculator();

async function main() {
  try {
    const allCafes = await locationDao.getAllCafeData();
    let ratesToUpdate = [];

    const allTasks = allCafes.map(async (cafe) => {
      const cafeName = cafe.name;
      const cafeId = cafe.id;

      let placeId;

      try {
        placeId = await googleMapsClient.getPlaceId(cafeName);
        if (!placeId) {
          console.error(`No location data found for cafe ${cafeName}`);
          return null;
        }
      } catch (err) {
        console.error(`getPlaceId Error : ${cafeName}, ${err.message}`);
        return null;
      }

      let placeData;

      try {
        placeData = await googleMapsClient.getPlaceDetails(placeId);
        if (!placeData || !placeData.geometry.location) {
          console.error(`getPlaceDetails Error : ${cafeName} is not available`);
          return null;
        }
      } catch (err) {
        console.error(err.message);
        return null;
      }

      const googleLocation = {
        lat: placeData.geometry.location.lat,
        lng: placeData.geometry.location.lng,
      };
      const dbLocation = {
        lat: cafe.cafe_latitude,
        lng: cafe.cafe_longitude,
      };

      if (
        !geoCalculator.checkDataByDistance(
          googleLocation.lat,
          googleLocation.lng,
          dbLocation.lat,
          dbLocation.lng
        )
      ) {
        return null;
      }

      let details;

      try {
        details = await googleMapsClient.getPlaceDetails(placeData.place_id);
      } catch (err) {
        console.error(
          `placeDetails Error : fetching place ID for cafe ${cafeName}, ${err.message}`
        );
        return null;
      }

      if (details.rating !== undefined && details.rating !== null) {
        ratesToUpdate.push({
          cafe_id: cafeId,
          score: details.rating,
        });
      }

      await locationDao.updateRate(ratesToUpdate);

      if (details.photos && details.photos.length > 0) {
        const maxPhotos = Math.min(details.photos.length, 3);

        for (let i = 0; i < maxPhotos; i++) {
          const imageName = `${cafeName.replace(/ /g, "_")}${i + 1}.jpg`;

          const excludedCafes = [
            "만월경",
            "에그카페24",
            "카페일분",
            "데이롱",
            "커피에반하다",
            "카페인24",
          ];

          if (excludedCafes.includes(cafeName)) {
            continue;
          }

          const fileExistsInS3 = await checkFileExistenceInS3(
            "s3-hosting-whichcafe",
            imageName
          );

          if (fileExistsInS3) {
            console.log(`File already exists in S3: ${imageName}`);
            continue;
          }

          let imageUrl;

          try {
            const imageData = await googleMapsClient.getPlacePhoto(
              details.photos[i].photo_reference
            );
            imageUrl = await uploadImageToS3(
              "s3-hosting-whichcafe",
              `cafeImage/${imageName}`,
              imageData
            );
          } catch (err) {
            console.error(`getPlacePhoto Error : ${cafeName}, ${err.message}`);
            continue;
          }

          try {
            const htmlAttribution =
              details.photos[i].html_attributions &&
              details.photos[i].html_attributions.length > 0
                ? details.photos[i].html_attributions[0]
                : null;
            await locationDao.savePhotoInfo(
              cafeId,
              htmlAttribution,
              imageName,
              imageUrl
            );
          } catch (err) {
            console.error(`savePhotoInfo Error : ${cafeName}, ${err.message}`);
            return null;
          }
        }
      }
    });

    const results = await Promise.allSettled(allTasks);

    const errors = results.filter((result) => result.status === "rejected");
    for (const error of errors) {
      console.error(error.reason);
    }
  } catch (error) {
    console.log(
      error.response ? error.response.data.error_message : error.message
    );
  }
}

const scheduledTask = schedule.scheduleJob("0 59 15 * * *", async function () {
  await main();
});

module.exports = { main, scheduledTask };
