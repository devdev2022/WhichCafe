require("dotenv").config();

const { createApp } = require("./app");
const dataSource = require("./src/models/dataSource");

const startServer = async () => {
  const app = createApp();
  const PORT = process.env.PORT;

  try {
    await dataSource.createConnection();
    console.log("Data Source has been initialized!!!");
  } catch (error) {
    console.log("Error occured during Data Source initialization", error);
  }

  app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
  });
};

startServer();
