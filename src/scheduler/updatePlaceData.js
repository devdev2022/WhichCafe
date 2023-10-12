require("dotenv").config({ path: "../../.env" });
const schedule = require("node-schedule");
const { Client } = require("@googlemaps/google-maps-services-js");
const locationDao = require("../models/locationDao");
const fs = require("fs");

const client = new Client({});

async function getPlaceId(query) {
  const response = await client.findPlaceFromText({
    params: {
      input: query,
      inputtype: "textquery",
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });
  return response.data.candidates[0].place_id;
}

async function getPlaceDetails(placeId) {
  const response = await client.placeDetails({
    params: {
      place_id: placeId,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });
  return response.data.result;
}

async function getDitsance(origin, destination) {
  const response = await client.distancematrix({
    params: {
      origins: [origin],
      destinations: [destination],
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });
  return response.data.rows[0].elements[0].distance.value;
}

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
  return response.data;
}

async function main() {
  try {
    const allCafes = await locationDao.getAllCafeData();
    let ratesToUpdate = [];

    for (const cafe of allCafes) {
      const cafeName = cafe.cafe_name;
      const cafeId = cafe.id;
      const placeId = await getPlaceId(cafeName);
      const details = await getPlaceDetails(placeId);

      ratesToUpdate.push({
        cafe_id: cafeId,
        score: details.rating,
      });

      if (details.photos && details.photos.length > 0) {
        const maxPhotos = Math.min(details.photos.length, 3);
        for (i = 0; i < maxPhotos; i++) {
          const imageData = await getPlacePhoto(
            details.photos[i].photo_reference
          );
          const imageName = `${cafeName.replace(/ /g, "_")}${i + 1}.jpg`;
          const savePath = `/Users/khs/Documents/WhichCafe/projectmaterial/cafeimage/${imageName}`;
          fs.writeFileSync(savePath, imageData);
          result.photoPath = savePath;
        }
      }
      await locationDao.updateRate(ratesToUpdate);
    }
  } catch (error) {
    console.log(
      error.response ? error.response.data.error_message : error.message
    );
  }
}

schedule.scheduleJob("0 2 1 * *", async function () {
  await main();
});
