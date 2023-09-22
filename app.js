const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { globalErrorHandler } = require("./src/utils/error");
const swaggerUi = require("swagger-ui-express");
const yaml = require("js-yaml");
const fs = require("fs");

const { swaggerAuthentication } = require("./src/utils/swagger/swaggerAuth");

const { router } = require("./src/routes");

const createApp = () => {
  const app = express();

  app.use(express.static("src/utils/swagger"));

  app.use(cors());
  app.use(express.json());
  app.use(morgan("combined"));

  const swaggerDocument = yaml.load(
    fs.readFileSync("./src/utils/swagger/swagger.yaml", "utf8")
  );

  app.use("/docs", swaggerAuthentication, swaggerUi.serve);
  app.get("/docs", swaggerUi.setup(swaggerDocument));

  app.use(router);

  app.use(globalErrorHandler);

  return app;
};

module.exports = { createApp };
