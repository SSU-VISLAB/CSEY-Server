import { Sequelize } from "sequelize";
import { config } from "../config/config.js";

export const sequelize = new Sequelize(
  config.development.DB_DATABASE,
  config.development.DB_USER,
  config.development.DB_PASSWORD,
  {
    host: config.development.DB_HOST,
    port: +config.development.DB_PORT,
    dialect: "mysql",
    logging: console.log,
  }
);

