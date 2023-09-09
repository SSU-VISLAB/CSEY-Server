// sequelize로 대체했으므로 사용 중지
import { createPool } from "mysql2/promise";

const mySql = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: +process.env.DB_PORT
});

export default mySql;