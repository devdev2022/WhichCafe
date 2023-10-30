require("dotenv").config({ path: "../../../.env" });
const { Client } = require("@googlemaps/google-maps-services-js");
const {
  placeIdSchema,
  placeDetailsSchema,
  validateResponse,
} = require("../../utils/ajvValidation/GoogleMapsAjv");

class GoogleMapsClient {
  constructor() {
    this.client = new Client({});
  }

  async getPlaceId(query) {
    try {
      const response = await this.client.findPlaceFromText({
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

  async getPlaceDetails(placeId) {
    try {
      const response = await this.client.placeDetails({
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

  async getPlacePhoto(photoReference) {
    const response = await this.client.placePhoto({
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
}

module.exports = { GoogleMapsClient };
