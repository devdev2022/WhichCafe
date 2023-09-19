const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { globalErrorHandler } = require("./src/utils/error");

const { router } = require("./src/routes");

const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan("combined"));

  app.use(router);

  app.use(globalErrorHandler);

  return app;
};

module.exports = { createApp };
