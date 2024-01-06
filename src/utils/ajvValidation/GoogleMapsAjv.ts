import Ajv from "ajv";

const ajv = new Ajv();

const placeIdSchema: any = {
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
    status: { type: "string" },
  },
  required: ["candidates", "status"],
};

const placeDetailsSchema: any = {
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
          nullable: true,
          items: {
            type: "object",
            properties: {
              photo_reference: { type: "string", nullable: true },
            },
            required: [],
          },
        },
      },
      required: ["geometry"],
    },
  },
  required: ["result"],
};

function validateResponse(schema: object, data: object) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    return validate.errors;
  }
  return null;
}

export { placeIdSchema, placeDetailsSchema, validateResponse };
