import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

ajv.addKeyword({
  keyword: "isHex",
  type: "object",
  validate: function (schema: any, data: any) {
    if (!Buffer.isBuffer(data)) return false;
    const hexString = data.toString("hex");
    return /^[0-9A-Fa-f]+$/.test(hexString);
  },
  errors: true,
});

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

const getUserIdSchema = {
  type: "object",
  properties: {
    id: { type: "object", isHex: true },
  },
  additionalProperties: false,
};

const getUserSchema = {
  type: "object",
  properties: {
    id: { type: "object", isHex: true },
    account: {
      type: "string",
      maxLength: 50,
    },
    password: {
      type: "string",
      maxLength: 64,
    },
    nickname: {
      type: "string",
      maxLength: 50,
    },
    question_answer: {
      type: "string",
      maxLength: 32,
    },
    created_at: {
      type: "object",
      isDateObject: true,
    },
  },
  required: [
    "id",
    "account",
    "password",
    "nickname",
    "question_answer",
    "created_at",
  ],
  additionalProperties: false,
  isNotEmpty: true,
};

const getFavoritesSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      id: { type: "number" },
      name: {
        type: "string",
        maxLength: 100,
      },
      address: {
        type: "string",
        maxLength: 100,
      },
      score: {
        type: ["number", "string", "null"],
        minimum: 0,
        maximum: 5,
        multipleOf: 0.01,
      },
      thumbnail: {
        type: "string",
        format: "uri",
        maxLength: 2083,
      },
    },
    required: ["id", "name", "address", "thumbnail"],
    additionalProperties: false,
    isNotEmpty: true,
  },
};

const findFavDataSchema = {
  type: "object",
  properties: {
    user_id: { isHex: true },
    cafe_id: { type: "number" },
  },
  additionalProperties: false,
  isNotEmpty: true,
};

const findRefreshTokenSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    user_id: { isHex: true },
    account: { type: "string" },
    refresh_token: { type: "string", maxLength: 255 },
    device_info: { type: ["string", "null"], maxLength: 255 },
    created_at: { type: "object", isDateObject: true },
    expires_at: { type: "object", isDateObject: true },
  },
  required: [
    "id",
    "user_id",
    "account",
    "refresh_token",
    "created_at",
    "expires_at",
  ],
  additionalProperties: false,
  isNotEmpty: true,
};

function validateResponse(schema: object, data: any | null) {
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

export {
  getUserIdSchema,
  getUserSchema,
  getFavoritesSchema,
  findFavDataSchema,
  findRefreshTokenSchema,
  validateResponse,
};
