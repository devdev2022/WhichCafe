const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("./src/scheduler/updatePlaceData");

const { swaggerAuthentication } = require("./src/utils/swagger/swaggerAuth");
const { router } = require("./src/routes");
const { globalErrorHandler } = require("./src/utils/error");

const createApp = () => {
  const app = express();

  app.use(express.static("src/utils/swagger"));

  app.use(cors());
  app.use(express.json());
  app.use(morgan("combined"));

  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "WhichCafe API",
        version: "1.0.0",
      },
    },

    apis: [
      "./src/utils/swagger/docs/userDocs.yaml",
      "./src/utils/swagger/docs/locationDocs.yaml",
    ],
  };
  const swaggerSpec = swaggerJsdoc(options);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(router);

  app.use(globalErrorHandler);

  return app;
};

module.exports = { createApp };
