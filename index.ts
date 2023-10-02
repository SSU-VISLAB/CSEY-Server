import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from '@adminjs/sequelize';
import AdminJS, { ActionQueryParameters, AdminJSOptions, Filter, ResourceWithOptions, SortSetter, flat, populator } from "adminjs";
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
		settings: {
			defaultPerPage: 5,
		},
		// 관리할 models 목록
		resources: [
			// user
			{resource: User, options: { navigation: false}}, // user tab으로 grouping
			{resource: Alarm, options: { navigation: false}},
			{resource: EventsLike, options: {navigation: false}},
			{resource: NoticesLike, options: {navigation: false}},
			// post
			{resource: Event, options: {
				navigation: postTab,
				listProperties: ['id', 'title', 'like', 'dislike', 'start', 'end'],
				actions: {
					list: {
						component: Components.Event_List,
						handler: async (request, response, context) => {
							const { query } = request
							const { resource, _admin } = context
							let { page, perPage, type = 'ongoing' } = flat.unflatten(query || {});
							const isOngoing = type == 'ongoing';
							const { sortBy = isOngoing ? 'start' : 'end', direction = 'desc', filters = {} } = flat.unflatten(query || {}) as ActionQueryParameters
					
							if (perPage) {
								perPage = +perPage > 500 ? 500 : +perPage
							} else {
								perPage = _admin.options.settings?.defaultPerPage ?? 10
							}
							page = Number(page) || 1
					
							const listProperties = resource.decorate().getListProperties()
							const firstProperty = listProperties.find((p) => p.isSortable())
							let sort
							if (firstProperty) {
								sort = SortSetter(
									{ sortBy, direction },
									firstProperty.name(),
									resource.decorate().options,
								)
							}
							const filter = await new Filter({...filters, ended: isOngoing ? 'false' : 'true'}, resource).populate(context)
					
							const { currentAdmin } = context
							const records = await resource.find(filter, {
								limit: perPage,
								offset: (page - 1) * perPage,
								sort,
							}, context)
							const populatedRecords = await populator(records, context)
					
							// eslint-disable-next-line no-param-reassign
							context.records = populatedRecords
					
							const total = await resource.count(filter, context)
							return {
								meta: {
									total,
									perPage,
									page,
									direction: sort?.direction,
									sortBy: sort?.sortBy,
								},
								records: populatedRecords.map((r) => r.toJSON(currentAdmin)),
							}
						},
					},
					// show: {
					// 	component: Components
					// },
					// edit: {
					// 	component: Components
					// },
					// new: {
					// 	component: Components
					// }
				}
			}}, // post tab으로 grouping
			{resource: Notice, options: { navigation: postTab}},
			// others
			{resource: Read, options: { navigation: false}}, // tab에 표시 안함
			{resource: ReadAsset, options: { navigation: false}},
			{resource: Bookmark, options: { navigation: false}},
			{resource: BookmarkAsset, options: { navigation: false}}
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
