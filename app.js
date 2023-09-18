const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./utils/errorHandler");

const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(morgan("combined"));
  app.use(errorHandler.globalErrorHandler);

  return app;
};

module.exports = { createApp };
