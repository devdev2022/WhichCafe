const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { globalErrorHandler } = require("./src/utils/errors");

const { router } = require("./src/routes");

const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(morgan("combined"));

  app.use(router);

  app.use(globalErrorHandler);
  return app;
};

module.exports = { createApp };
