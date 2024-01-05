import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app";
import { database } from "./src/models/dataSource";

const startServer = async () => {
  const app = createApp();
  const PORT = process.env.PORT;

  try {
    const conn = await database.getConnection();
    if (conn) {
      console.log("Data Source has been initialized!!!");
      conn.release();
    }
  } catch (error) {
    console.log("Error occured during Data Source initialization", error);
    process.exit(1);
  }

  app.get("/ping", (req, res) => {
    res.json({ message: "pong" });
  });

  app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
  });
};

startServer();
