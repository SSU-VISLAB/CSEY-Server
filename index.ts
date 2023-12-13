import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from '@adminjs/sequelize';
import AdminJS from "adminjs";
import cors from "cors";
import cookieParser from "cookie-parser";
import express, { json, urlencoded } from "express";
import path from "path";
import * as url from 'url';
import { Components, componentLoader } from "./adminPage/components/index.ts";
import { COMMON, EVENT, NOTICE } from "./adminPage/resources/index.ts";
import { Alarm, Bookmark, BookmarkAsset, Event, EventsLike, Notice, NoticesLike, Read, ReadAsset, User, sequelize } from "./models/index.ts";
import { connectRedis, redisClient } from "./redis/redis_server.ts";
import alarmRouter from "./routes/alarm.ts";
import eventRouter from "./routes/event.ts";
import noticeRouter from "./routes/notice.ts";
import userRouter from "./routes/user.ts";
import { adminOptions } from "./adminPage/index.ts";
import { sequelize } from "./models/index.ts";

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

	await connectRedis();
	// 연결 test
	redisClient.set('success', 1).then((v) => console.log('redis set success:', {v}));
	redisClient.get('success').then((v) => console.log('redis get success:', {v}));
	await sequelize
		.authenticate()
		.then(async () => {
			console.log("sequelize connection success");
		})
		.catch((e) => {
			console.log("sequelize error : ", e);
		});

	app.listen(3000, () => {
		console.log(`AdminJS started on http://localhost:${3000}${admin.options.rootPath}`);
	});
};
start();
