import AdminJSExpress from '@adminjs/express';
import AdminJS from 'adminjs';
import cors from "cors";
import express, { json, urlencoded } from "express";
import { sequelize } from './models/index.ts';
import userRouter from "./routes/user.ts";
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

const start = async () => {
    const admin = new AdminJS({})

    const adminRouter = AdminJSExpress.buildRouter(admin)
    app.use(admin.options.rootPath, adminRouter)
  
    app.listen(3000, () => {
      console.log(`AdminJS started on http://localhost:${3000}${admin.options.rootPath}`)
    })
    await sequelize.authenticate()
    .then(async () => {
        console.log("sequelize connection success");
    })
    .catch((e) => {
        console.log('sequelize error : ', e);
    })
}
start();