require("dotenv").config();

const { createApp } = require("./app");
const { connection } = require("./src/models/data-source");

const startServer = async () => {
  const app = createApp();
  const PORT = process.env.PORT;

  try {
    const conn = await connection.getConnection();
    conn.release();
    console.log("Data Source has been initialized!!!");
  } catch (error) {
    console.log("Error during Data Source initialization", error);
  }

  app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
  });
};

startServer();
