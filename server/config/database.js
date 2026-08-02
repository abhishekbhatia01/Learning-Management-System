import { Sequelize } from "sequelize";
import "dotenv/config";

export const sequelize = new Sequelize(
  process.env.DB_NAME || "learnify",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "root",
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  }
);
