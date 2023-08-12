import { config } from "dotenv";
config();
import express, { json, urlencoded } from "express";
import cors from "cors";
import userRouter from "./routes/user";
import mySql from "./mysql/mysql_database";

// const corsOptions = {
//     origin: 'https://',
//     credentials: true
// }
const app = express();
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cors(/*corsOptions*/));
app.get('/', async (req, res) => res.sendFile(__dirname + '/test.html'));
app.get('/login', (req, res) => res.sendFile(__dirname + '/testLogin.html'));
app.use('/api', userRouter);
(async () => {
    const testQuery = `SELECT * FROM users;`
    const conn = await mySql.getConnection();
    const [res] = await conn.query(testQuery);
    console.log(res);
})();

app.listen(3000, () => console.log('Example app listening on port http://localhost:3000'));