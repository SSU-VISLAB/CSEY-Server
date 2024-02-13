import dotenv from "dotenv";
dotenv.config({
  path: '../.env'
});

const {
  DB_HOST,
  DB_USER,
  DB_DATABASE,
  DB_PASSWORD,
  DB_PORT
} = process.env;

export const config = {
  development : {
      DB_HOST,
      DB_USER,
      DB_DATABASE,
      DB_PASSWORD,
      DB_PORT,
      dialect : "mysql"
  }
}
