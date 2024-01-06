import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { authMiddleware } from "./src/utils/swaggerAuth";

import myModule from "./src/scheduler/updatePlaceData";

import { router } from "./src/routes";
import { globalErrorHandler } from "./src/utils/error";

const createApp = () => {
  const app = express();

  app.use(express.static("src/utils/swagger"));

  app.use(cookieParser());

  app.use(
    cors({
      origin: "https://cafeeodi.com",
      credentials: true,
      methods: "GET,POST,DELETE,PATCH,OPTIONS",
      allowedHeaders:
        "Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, Cookie, refreshToken",
    })
  );
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
      "./src/utils/swagger/userDocs.yaml",
      "./src/utils/swagger/locationDocs.yaml",
    ],
  };
  myModule.scheduledTask;

  const swaggerSpec = swaggerJsdoc(options);
  app.use(
    "/docs",
    authMiddleware,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );

  app.use(router);

  app.use(globalErrorHandler);

  return app;
};

export { createApp };
