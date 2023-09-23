import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from '@adminjs/sequelize';
import AdminJS, { AdminJSOptions, ResourceWithOptions } from "adminjs";
import cors from "cors";
import express, { json, urlencoded } from "express";
import { Components, componentLoader } from "./components/index.ts";
import { Alarm, Bookmark, BookmarkAsset, Event, EventsLike, Notice, NoticesLike, Read, ReadAsset, User, sequelize } from "./models/index.ts";
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
	// icon name list: https://feathericons.com/
	// PascalCase
	const userTab = {
		name: '사용자 관리',
		icon: 'Users',
	};
	const postTab = {
		name: '작성글 관리',
		icon: 'Edit',

	};
	const adminOptions: AdminJSOptions = {
		dashboard: {
			component: Components.Dashboard
		},
		// 번역(기본 영어)
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
		// 관리할 models 목록
		resources: [
			// user
			{resource: User, options: { navigation: userTab}}, // user tab으로 grouping
			{resource: Alarm, options: {
				navigation: userTab,
				actions: {
					list: {
						component: Components.test
					}
				}
			}},
			{resource: EventsLike, options: {navigation: userTab}},
			{resource: NoticesLike, options: {navigation: userTab}},
			// post
			{resource: Event, options: { navigation: postTab}}, // post tab으로 grouping
			{resource: Notice, options: { navigation: postTab}},
			// others
			{resource: Read, options: { navigation: false}}, // tab에 표시 안함
			{resource: ReadAsset, options: {
				properties: {
					id: { // id 속성을 모든 action에서 표시하지 않음
						isVisible: false,
					}
				}
			}},
			{resource: Bookmark, options: { navigation: false}},
			{resource: BookmarkAsset, options: {
				properties: {
					id: {
						isVisible: false,
					}
				}
			}}
		] as ResourceWithOptions[],
		componentLoader
	};
  const admin = new AdminJS(adminOptions);
	admin.watch();
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
