import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from '@adminjs/sequelize';
import uploadFeature from '@adminjs/upload';
import AdminJS, { AdminJSOptions, ResourceWithOptions } from "adminjs";
import cors from "cors";
import express, { json, urlencoded } from "express";
import path from "path";
import * as url from 'url';
import { Components, componentLoader } from "./adminPage/components/index.ts";
import { Handlers } from "./adminPage/handlers/index.ts";
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
			{ resource: User, options: { navigation: false } }, // user tab으로 grouping
			{ resource: Alarm, options: { navigation: false } },
			{ resource: EventsLike, options: { navigation: false } },
			{ resource: NoticesLike, options: { navigation: false } },
			// post
			{
				resource: Event, options: {
					navigation: postTab,
					listProperties: ['id', 'title', 'like', 'dislike', 'start', 'end'],
					showProperties: ['major_advisor', 'like', 'dislike', 'ended', 'start', 'end', 'title', 'content', 'image'],
					actions: {
						list: {
							component: Components.event_list,
							handler: Handlers.EventHandler.list,
						},
						show: {
							component: Components.event_show
						},
						// edit: {
						// 	component: Components
						// },
						// new: {
						// 	component: Components
						// }
					}
				}, features: [uploadFeature({
					provider: {
						// bucket과 baseUrl 작동 잘 하는가?
						local: {
							bucket: 'public',
							opts: {
								baseUrl: ''
							}
						}
					},
					componentLoader,
					// properties의 의미는?
					// DB 새로 생성
					properties: {
						key: "/",
					}
				})]
			}, // post tab으로 grouping
			{ resource: Notice, options: { navigation: postTab } },
			// others
			{ resource: Read, options: { navigation: false } }, // tab에 표시 안함
			{ resource: ReadAsset, options: { navigation: false } },
			{ resource: Bookmark, options: { navigation: false } },
			{ resource: BookmarkAsset, options: { navigation: false } }
		] as ResourceWithOptions[],
		componentLoader
	};
	const admin = new AdminJS(adminOptions);
	admin.watch();
	const adminRouter = AdminJSExpress.buildRouter(admin);
	app.use(admin.options.rootPath, adminRouter);
	const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

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
