require("dotenv").config();

const { createApp } = require("./app");
const dataSource = require("./src/models/dataSource");

const startServer = async () => {
  const app = createApp();
  const PORT = process.env.PORT;

  try {
    const connection = await dataSource.createConnection();
    console.log("Data Source has been initialized!!!");
    await connection.end();
  } catch (error) {
    console.log("Error during Data Source initialization", error);
  }

  app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
  });
};

startServer();
