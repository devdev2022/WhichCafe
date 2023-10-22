require("dotenv").config({ path: "../../.env" });
const schedule = require("node-schedule");
const { Client } = require("@googlemaps/google-maps-services-js");
const locationDao = require("../models/locationDao");
const fs = require("fs");
const {
  placeIdSchema,
  placeDetailsSchema,
  validateResponse,
} = require("./responseCheck");

const client = new Client({});

async function getPlaceId(query) {
  try {
    const response = await client.findPlaceFromText({
      params: {
        input: query,
        inputtype: "textquery",
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    const errors = validateResponse(placeIdSchema, response.data);
    if (errors) {
      console.error("Validation Error:", errors);
      return null;
    }

    return response.data.candidates && response.data.candidates.length > 0
      ? response.data.candidates[0].place_id
      : null;
  } catch (error) {
    console.error(`findPlaceFromText Error : ${query}, ${error.message}`);
    return null;
  }
}

async function getPlaceDetails(placeId) {
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    const errors = validateResponse(placeDetailsSchema, response.data);
    if (errors) {
      console.error("Validation Error:", errors);
      return null;
    }

    return response.data.result;
  } catch (error) {
    console.error(`getPlaceDetails Error : ${query}, ${error.message}`);
  }
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius, km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance, km
  return distance * 1000; // Convert to meters
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

const checkDataByDistance = async (lat1, lon1, lat2, lon2, limit = 20) => {
  const distance = getDistance(lat1, lon1, lat2, lon2);
  return distance <= limit;
};

async function getPlacePhoto(photoReference) {
  const response = await client.placePhoto({
    params: {
      photoreference: photoReference,
      maxwidth: 400,
      maxheight: 400,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
    responseType: "arraybuffer",
  });

  if (response.status !== 200) {
    console.error("Error fetching photo:", response.status);
    return null;
  }

  if (!response.headers["content-type"].startsWith("image/")) {
    console.error("Invalid content type:", response.headers["content-type"]);
    return null;
  }
  return response.data;
}

async function main() {
  try {
    const allCafes = await locationDao.getAllCafeData();
    let ratesToUpdate = [];

    for (const cafe of allCafes.slice(0, 10)) {
      const cafeName = cafe.name;
      const cafeId = cafe.id;

      let placeId;

      try {
        placeId = await getPlaceId(cafeName);
        if (!placeId) {
          console.error(`No location data found for cafe ${cafeName}`);
          continue;
        }
      } catch (err) {
        console.error(`getPlaceId Error : ${cafeName}, ${err.message}`);
        continue;
      }

      let placeData;

      try {
        placeData = await getPlaceDetails(placeId);
        if (!placeData || !placeData.geometry.location) {
          console.error(`getPlaceDetails Error : ${cafeName} is not available`);
          continue;
        }
      } catch (err) {
        console.error(err.message);
        continue;
      }

      console.log(placeData.geometry.location);

      const googleLocation = {
        lat: placeData.geometry.location.lat,
        lng: placeData.geometry.location.lng,
      };
      const dbLocation = {
        lat: cafe.cafe_latitude,
        lng: cafe.cafe_longitude,
      };

      const checkResponseData = checkDataByDistance(
        googleLocation.lat,
        googleLocation.lng,
        dbLocation.lat,
        dbLocation.lng
      );

      if (!checkResponseData) {
        continue;
      }

      if (placeData.rating !== undefined && placeData.rating !== null) {
        ratesToUpdate.push({
          cafe_id: cafeId,
          score: placeData.rating,
        });
      }

      if (placeData.photos && placeData.photos.length > 0) {
        const maxPhotos = Math.min(placeData.photos.length, 3);

        let imageData;

        for (let i = 0; i < maxPhotos; i++) {
          let imageName;
          try {
            imageData = await getPlacePhoto(
              placeData.photos[i].photo_reference
            );
            if (!imageData) continue;

            imageName = `${cafeName.replace(/ /g, "_")}${i + 1}.jpg`;
            const savePath = `/Users/khs/Documents/WhichCafe/projectmaterial/cafeimage/${imageName}`;

            const excludedCafes = [
              "만월경",
              "에그카페24",
              "카페일분",
              "데이롱카페",
              "커피에반하다",
              "카페인24",
            ];

            if (fs.existsSync(savePath) || excludedCafes.includes(cafeName)) {
              continue;
            }

            await fs.promises.writeFile(savePath, imageData);
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
            await locationDao.savePhotoInfo(cafeId, htmlAttribution, imageName);
          } catch (err) {
            console.log(imageName);
            console.error(`savePhotoInfo Error : ${cafeName}, ${err.message}`);
            return null;
          }
        }
      }
    }

    if (ratesToUpdate.length > 0) {
      await locationDao.updateRate(ratesToUpdate);
    }
  } catch (error) {
    console.error("Error in main function: ", error);
  }
}

const scheduledTask = schedule.scheduleJob("0 02 16 * * *", async function () {
  await main();
});

module.exports = { main, scheduledTask };
