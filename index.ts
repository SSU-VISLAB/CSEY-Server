import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from '@adminjs/sequelize';
import AdminJS from "adminjs";
import cors from "cors";
import express, { json, urlencoded } from "express";
import path from "path";
import * as url from 'url';
import { adminOptions } from "./adminPage/index.ts";
import { sequelize } from "./models/index.ts";
import userRouter from "./routes/user.ts";

// const corsOptions = {
//     origin: 'https://',
//     credentials: true
// }

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const app = express();
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cors(/*corsOptions*/));

// app.get('/', async (req, res) => res.sendFile(__dirname + '/test.html'));
// app.get('/login', (req, res) => res.sendFile(__dirname + '/testLogin.html'));
app.use("/api", userRouter);

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

	app.listen(3000, () => {
		console.log(`AdminJS started on http://localhost:${3000}${admin.options.rootPath}`);
	});
};
start();
