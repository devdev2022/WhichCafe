require("dotenv").config({ path: "../../.env" });
const { Client } = require("@googlemaps/google-maps-services-js");
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
    const cafeName = "빵파남 커파남";
    const placeId = await getPlaceId(cafeName);
    const details = await getPlaceDetails(placeId);

    let result = {
      rate: details.rating,
    };

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

    console.log(result);
  } catch (error) {
    console.log(
      error.response ? error.response.data.error_message : error.message
    );
  }
}

main();
