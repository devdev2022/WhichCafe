require("dotenv").config({ path: "../../.env" });
const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});

client
  .findPlaceFromText({
    params: {
      input: "할리스 굽은다리역점",
      inputtype: "textquery",
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  })
  .then((response) => {
    console.log(response.data);
    const placeId = response.data.candidates[0].place_id;

    return client.placeDetails({
      params: {
        place_id: placeId,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
  })
  .then((response) => {
    const details = response.data.result;

    const result = {
      photo: details.photos,
      rate: details.rating,
    };
    //console.log(result);
  })
  .catch((error) => {
    console.log(
      error.response ? error.response.data.error_message : error.message
    );
  });
