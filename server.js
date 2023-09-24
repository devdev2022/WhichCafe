require("dotenv").config();

const { createApp } = require("./app");
const { database } = require("./src/models/dataSource");

const startServer = async () => {
  const app = createApp();
  const PORT = process.env.PORT;

  try {
    await database.getConnection();
    console.log("Data Source has been initialized!!!");
  } catch (error) {
    console.log("Error occured during Data Source initialization", error);
  }

  app.get("/ping", (req, res) => {
    res.json({ message: "pong" });
  });

  app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
  });
};

startServer();
