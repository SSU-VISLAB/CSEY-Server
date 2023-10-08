import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from '@adminjs/sequelize';
import AdminJS, { AdminJSOptions, ResourceWithOptions } from "adminjs";
import cors from "cors";
import express, { json, urlencoded } from "express";
import path from "path";
import * as url from 'url';
import { Components, componentLoader } from "./adminPage/components/index.ts";
import { COMMON, EVENT, NOTICE } from "./adminPage/resources/index.ts";
import { Alarm, Bookmark, BookmarkAsset, Event, EventsLike, Notice, NoticesLike, Read, ReadAsset, User, sequelize } from "./models/index.ts";
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
	const adminOptions: AdminJSOptions = {
		dashboard: {
			component: Components.Dashboard
		},
		// 번역(기본 - en)
		locale: {
			language: 'en',
			translations: {
				en: {
					actions: {
						list: 'list1',
						search: 'search1',
						new: '새로 만들기',
						show: 'show1',
						edit: 'edit1',
						delete: 'delete1'
					},
					labels: {
						users: '사용자',
						alarms: '알림',
						events_like: '사용자-행사',
						notices_like: '사용자-공지',
						events: '행사',
						notices: '공지',
					}
				}
			}
		},
		// list에서 페이지 별 표시될 행 수
		settings: {
			defaultPerPage: 5,
		},
		// 따로 추가할 정적 파일들 (css, js)
		assets: {
			styles: ["/event_show.css"]
		},
		// 관리할 models 목록
		resources: [
			// user
			{ resource: User, options: COMMON.options },
			{ resource: Alarm, options: COMMON.options },
			{ resource: EventsLike, options: COMMON.options },
			{ resource: NoticesLike, options: COMMON.options },
			// post
			{ resource: Event, options: EVENT.options, features: EVENT.features},
			{ resource: Notice, options: NOTICE.options },
			// others
			{ resource: Read, options: COMMON.options },
			{ resource: ReadAsset, options: COMMON.options },
			{ resource: Bookmark, options: COMMON.options },
			{ resource: BookmarkAsset, options: COMMON.options }
		] as ResourceWithOptions[],
		componentLoader
	};
	
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
