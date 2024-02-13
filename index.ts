import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from '@adminjs/sequelize';
import AdminJS from "adminjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { json, urlencoded } from "express";
import path from "path";
import * as url from 'url';
import { adminOptions } from "./adminPage/index.js";
import { sequelize } from "./models/index.js";
import { initializeRedis } from "./redis/initialize.js";
import alarmRouter from "./routes/alarm.js";
import eventRouter from "./routes/event.js";
import noticeRouter from "./routes/notice.js";
import userRouter from "./routes/user.js";

const corsOptions = {
    origin: 'http://localhost:8080',
    credentials: true
}

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const app = express();
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cors(corsOptions));
app.use(cookieParser());

// app.get('/', async (req, res) => res.sendFile(__dirname + '/test.html'));
// app.get('/login', (req, res) => res.sendFile(__dirname + '/testLogin.html'));
app.use("/api", noticeRouter);
app.use("/api", userRouter);
app.use("/api", eventRouter);
app.use("/api", alarmRouter);

AdminJS.registerAdapter({
	Resource: AdminJSSequelize.Resource,
	Database: AdminJSSequelize.Database
});

const start = async () => {
	const admin = new AdminJS(adminOptions);
	admin.watch();
	const adminRouter = AdminJSExpress.buildRouter(admin);
	// admin page router 설정
	app.use(admin.options.rootPath, adminRouter);
	app.use(express.static(path.join(__dirname, "./adminPage/components/css")));
	app.use(express.static(path.join(__dirname, "./public")));

	await sequelize
		.authenticate()
		.then(async () => {
			console.log("sequelize connection success");
		})
		.catch((e) => {
			console.log("sequelize error : ", e);
		});
	// 연결 test 및 게시글 캐싱
	await initializeRedis();

	app.listen(3000, () => {
		console.log(`AdminJS started on http://localhost:${3000}${admin.options.rootPath}`);
	});
};
start();
