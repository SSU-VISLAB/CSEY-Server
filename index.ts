import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from '@adminjs/sequelize';
import AdminJS, { AdminJSOptions } from "adminjs";
import cors from "cors";
import express, { json, urlencoded } from "express";
import Alarm from "./models/alarms.ts";
import Event from "./models/events.ts";
import { sequelize } from "./models/index.ts";
import Notice from "./models/notice.ts";
import User from "./models/user.ts";
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
app.use("/api", userRouter);

AdminJS.registerAdapter({
	Resource: AdminJSSequelize.Resource,
	Database: AdminJSSequelize.Database
});

const start = async () => {
	const adminOptions: AdminJSOptions = {
		resources: [
			User,
			Alarm,
			Notice,
			Event
		],
	}
  const admin = new AdminJS(adminOptions);
  const adminRouter = AdminJSExpress.buildRouter(admin);
  app.use(admin.options.rootPath, adminRouter);

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
