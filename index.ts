import cors from "cors";
import express, { json, urlencoded } from "express";
import { sequelize } from "./models";
import userRouter from "./routes/user";

// const corsOptions = {
//     origin: 'https://',
//     credentials: true
// }
const app = express();
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cors(/*corsOptions*/));

// app.get('/', async (req, res) => res.sendFile(__dirname + '/test.html'));
// app.get('/login', (req, res) => res.sendFile(__dirname + '/testLogin.html'));
app.use('/api', userRouter);

app.listen(3000, async() => {
    console.log('Example app listening on port 3000!')
    // sequelize-db 연결 테스트
    await sequelize.authenticate()
    .then(async () => {
        console.log("sequelize connection success");
    })
    .catch((e) => {
        console.log('sequelize error : ', e);
    })
});