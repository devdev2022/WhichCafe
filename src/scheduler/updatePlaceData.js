const schedule = require("node-schedule");
const locationDao = require("../models/locationDao");
const {
  GoogleMapsClient,
  GeoCalculator,
  S3ClientModule,
} = require("./helpers");

const googleMapsClient = new GoogleMapsClient();
const geoCalculator = new GeoCalculator();
const s3ClientModule = new S3ClientModule();

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

      const distanceCheckResult = await geoCalculator.checkDataByDistance(
        googleLocation.lat,
        googleLocation.lng,
        dbLocation.lat,
        dbLocation.lng
      );

      if (!distanceCheckResult) {
        return null;
      }

      if (placeData.rating !== undefined && placeData.rating !== null) {
        ratesToUpdate.push({
          cafe_id: cafeId,
          score: placeData.rating,
        });
      }

      await locationDao.updateRate(ratesToUpdate);

      if (placeData.photos && placeData.photos.length > 0) {
        const maxPhotos = Math.min(placeData.photos.length, 3);

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

          const fileExistsInS3 = await s3ClientModule.checkFileExistenceInS3(
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
              placeData.photos[i].photo_reference
            );
            imageUrl = await s3ClientModule.uploadImageToS3(
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
              placeData.photos[i].html_attributions &&
              placeData.photos[i].html_attributions.length > 0
                ? placeData.photos[i].html_attributions[0]
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

    console.log("DB UPDATE COMPLETE");
  } catch (error) {
    console.log(
      error.response ? error.response.data.error_message : error.message
    );
  }
}

const scheduledTask = schedule.scheduleJob("0 0 4 1 * *", async function () {
  await main();
});

module.exports = { main, scheduledTask };
