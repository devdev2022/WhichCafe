import {
  Client,
  PlaceDetailsResponse,
  FindPlaceFromTextResponse,
  PlacePhotoResponse,
  PlaceInputType,
} from "@googlemaps/google-maps-services-js";

import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import {
  placeIdSchema,
  placeDetailsSchema,
  validateResponse,
} from "../../utils/ajvValidation/GoogleMapsAjv";

class GoogleMapsClient {
  private client: Client;

  constructor() {
    this.client = new Client({});
  }

  async getPlaceId(query: string): Promise<string | null> {
    try {
      const response: FindPlaceFromTextResponse =
        await this.client.findPlaceFromText({
          params: {
            input: query,
            inputtype: PlaceInputType.textQuery,
            key: process.env.GOOGLE_MAPS_API_KEY as string,
          },
        });

      const errors = validateResponse(
        placeIdSchema,
        JSON.stringify(response.data)
      );
      if (errors) {
        console.error("Validation Error:", errors);
        return null;
      }

      const candidates = response.data.candidates;
      return candidates && candidates.length > 0 && candidates[0].place_id
        ? candidates[0].place_id
        : null;
    } catch (error) {
      console.error(`findPlaceFromText Error : ${query}, ${error}`);
      return null;
    }
  }

  async getPlaceDetails(
    placeId: string
  ): Promise<PlaceDetailsResponse["data"]["result"] | null> {
    try {
      const response: PlaceDetailsResponse = await this.client.placeDetails({
        params: {
          place_id: placeId,
          key: process.env.GOOGLE_MAPS_API_KEY as string,
        },
      });

      const errors = validateResponse(
        placeDetailsSchema,
        JSON.stringify(response.data)
      );
      if (errors) {
        console.error("Validation Error:", errors);
        return null;
      }

      return response.data.result;
    } catch (error) {
      console.error(`getPlaceDetails Error: ${error}`);
      return null;
    }
  }

  async getPlacePhoto(photoReference: string): Promise<Buffer | null> {
    try {
      const response: PlacePhotoResponse = await this.client.placePhoto({
        params: {
          photoreference: photoReference,
          maxwidth: 400,
          maxheight: 400,
          key: process.env.GOOGLE_MAPS_API_KEY as string,
        },
        responseType: "arraybuffer",
      });

      if (response.status !== 200) {
        console.error("Error fetching photo:", response.status);
        return null;
      }

      if (!response.headers["content-type"].startsWith("image/")) {
        console.error(
          "Invalid content type:",
          response.headers["content-type"]
        );
        return null;
      }

      return Buffer.from(response.data);
    } catch (error) {
      console.error("Error fetching photo:", error);
      return null;
    }
  }
}

export { GoogleMapsClient };
