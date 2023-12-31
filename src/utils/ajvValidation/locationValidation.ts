import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

ajv.addKeyword({
  keyword: "isNotEmpty",
  type: "object",
  validate: function (schema: any, data: any) {
    return data !== null && Object.keys(data).length > 0;
  },
  errors: true,
});

ajv.addKeyword({
  keyword: "isDateObject",
  type: "object",
  validate: function (schema: any, data: any) {
    return data instanceof Date;
  },
  errors: false,
});

const getNearbyAddressSchema: any = {
  type: "array",
  items: {
    type: "object",
    properties: {
      cafe_id: { type: "number" },
      cafe_name: {
        type: "string",
        maxLength: 100,
      },
      cafe_thumbnail: {
        type: "string",
        format: "uri",
        maxLength: 2083,
      },
      cafe_address: {
        type: "string",
        maxLength: 100,
      },
      score: {
        anyOf: [{ type: "string" }, { type: "null" }],
      },
      cafe_latitude: {
        type: "string",
      },
      cafe_longitude: {
        type: "string",
      },
      cafe_photos: {
        type: ["array", "null"],
        items: {
          oneOf: [
            {
              type: "string",
              maxLength: 2083,
            },
            {
              type: "null",
            },
          ],
        },
      },
      distance: {
        type: "string",
      },
    },
    required: [
      "cafe_id",
      "cafe_name",
      "cafe_thumbnail",
      "cafe_address",
      "score",
      "cafe_latitude",
      "cafe_longitude",
      "cafe_photos",
      "distance",
    ],
    additionalProperties: false,
    isNotEmpty: true,
  },
};

const searchCafesSchema: any = {
  type: "array",
  items: {
    type: "object",
    properties: {
      cafe_id: { type: "number" },
      cafe_name: {
        type: "string",
        maxLength: 100,
      },
      cafe_thumbnail: {
        type: "string",
        format: "uri",
        maxLength: 2083,
      },
      cafe_address: {
        type: "string",
        maxLength: 100,
      },
      score: {
        type: ["string", "null"],
      },
      cafe_latitude: {
        type: "string",
      },
      cafe_longitude: {
        type: "string",
      },
      cafe_photos: {
        type: ["array", "null"],
        items: {
          oneOf: [
            {
              type: "string",
              maxLength: 2083,
            },
            {
              type: "null",
            },
          ],
        },
      },
    },
    required: [
      "cafe_id",
      "cafe_name",
      "cafe_thumbnail",
      "cafe_address",
      "score",
      "cafe_latitude",
      "cafe_longitude",
      "cafe_photos",
    ],
    additionalProperties: false,
    isNotEmpty: true,
  },
};

function validateResponse(schema: object, data: string) {
  if (data === null) {
    return null;
  }
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    return validate.errors;
  }
  return null;
}

export { getNearbyAddressSchema, searchCafesSchema, validateResponse };
