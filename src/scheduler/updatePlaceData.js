require("dotenv").config({ path: "../../.env" });
const schedule = require("node-schedule");
const { Client } = require("@googlemaps/google-maps-services-js");
const locationDao = require("../models/locationDao");
const fs = require("fs");

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
    return response.data.candidates && response.data.candidates.length > 0
      ? response.data.candidates[0].place_id
      : null;
  } catch (error) {
    console.error(
      `Error fetching place ID for query ${query}: ${error.message}`
    );
    return null;
  }
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
  return new Promise((resolve) => {
    const distance = getDistance(lat1, lon1, lat2, lon2);
    resolve(distance <= limit);
  });
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
  return response.data;
}

async function main() {
  try {
    const allCafes = await locationDao.getAllCafeData();
    let ratesToUpdate = [];

    const allTasks = allCafes.slice(0, 10).map(async (cafe) => {
      const cafeName = cafe.name;
      const cafeId = cafe.id;

      let placeId;

      try {
        placeId = await getPlaceId(cafeName);
        if (!placeId) {
          console.error(`No location data found for cafe ${cafeName}`);
          return null;
        }
      } catch (err) {
        console.error(
          `Error fetching place ID for cafe ${cafeName}: ${err.message}`
        );
        return null;
      }

      let placeData;

      try {
        placeData = await getPlaceDetails(placeId);
        if (!placeData || !placeData.geometry.location) {
          console.error(`Location data for cafe ${cafeName} is not available`);
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
        !checkDataByDistance(
          googleLocation.lat,
          googleLocation.lng,
          dbLocation.lat,
          dbLocation.lng
        )
      ) {
        return null;
      }

      try {
        details = await getPlaceDetails(placeData.place_id);
      } catch (err) {
        console.error(
          `Error fetching place ID for cafe ${cafeName}: ${err.message}`
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

      let htmlAttributions = details.html_attributions;

      if (details.photos && details.photos.length > 0) {
        const maxPhotos = Math.min(details.photos.length, 3);

        let imageData;

        for (let i = 0; i < maxPhotos; i++) {
          const imageName = `${cafeName.replace(/ /g, "_")}${i + 1}.jpg`;
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

          try {
            imageData = await getPlacePhoto(details.photos[i].photo_reference);
            await fs.promises.writeFile(savePath, imageData);
          } catch (err) {
            console.error(
              `Error fetching place ID for cafe ${cafeName}: ${err.message}`
            );
            return null;
          }
        }
      }
      await locationDao.updateImgHtml(htmlAttributions, cafeId);
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

const scheduledTask = schedule.scheduleJob("0 30 21 * * *", async function () {
  await main();
});

module.exports = { main, scheduledTask };
