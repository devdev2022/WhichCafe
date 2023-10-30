const Ajv = require("ajv");
const ajv = new Ajv();
require("ajv-formats")(ajv);

ajv.addKeyword({
  keyword: "isNotEmpty",
  type: "object",
  validate: function (schema, data) {
    return data !== null && Object.keys(data).length > 0;
  },
  errors: true,
});

ajv.addKeyword({
  keyword: "isDateObject",
  type: "object",
  validate: function (schema, data) {
    return data instanceof Date;
  },
  errors: false,
});

const getUserIdSchema = {
  type: "string",
  properties: {
    id: { type: "string", format: "uuid" },
  },
  required: ["id"],
  additionalProperties: false,
  isNotEmpty: true,
};

const getUserSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    account: {
      type: "string",
      maxLength: 50,
    },
    password: {
      type: "string",
      maxLength: 256,
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
        type: ["number", "null"],
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
  },
};

const findFavDataSchema = {
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
        type: ["number", "null"],
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

function validateResponse(schema, data) {
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

module.exports = {
  getUserIdSchema,
  getUserSchema,
  getFavoritesSchema,
  findFavDataSchema,
  validateResponse,
};
