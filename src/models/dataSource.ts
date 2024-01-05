import mysql, { Pool } from "mysql2/promise";

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
}

const databaseConfig: DatabaseConfig = {
  host: process.env.MYSQL_HOST as string,
  user: process.env.MYSQL_USERNAME as string,
  password: process.env.MYSQL_PASSWORD as string,
  database: process.env.MYSQL_DATABASE as string,
  connectionLimit: 10,
};

const database: Pool = mysql.createPool(databaseConfig);

export { database };
