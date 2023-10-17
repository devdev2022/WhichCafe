const Ajv = require("ajv");
const ajv = new Ajv();

const placeIdSchema = {
  type: "object",
  properties: {
    candidates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          place_id: { type: "string" },
        },
        required: ["place_id"],
      },
    },
  },
  required: ["candidates"],
};

const placeDetailsSchema = {
  type: "object",
  properties: {
    result: {
      type: "object",
      properties: {
        geometry: {
          type: "object",
          properties: {
            location: {
              type: "object",
              properties: {
                lat: { type: "number" },
                lng: { type: "number" },
              },
              required: ["lat", "lng"],
            },
          },
          required: ["location"],
        },
        photos: {
          type: "array",
          items: {
            type: "object",
            properties: {
              photo_reference: { type: "string" },
            },
          },
        },
      },
      required: ["geometry"],
    },
  },
  required: ["result"],
};

function validateResponse(schema, data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    return validate.errors;
  }
  return null;
}

module.exports = {
  placeIdSchema,
  placeDetailsSchema,
  validateResponse,
};
