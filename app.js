const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(morgan("combined"));

  return app;
};

module.exports = { createApp };
