import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from "@adminjs/sequelize";
import AdminJS from "adminjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { json, urlencoded } from "express";
import path from "path";
import * as url from "url";
import { adminOptions, authProvider } from "./adminPage/index.js";
import { sequelize } from "./models/index.js";
import { initializeRedis } from "./redis/initialize.js";
import { isRunOnDist, mode } from "./adminPage/components/index.js";
import { alarmRouter, eventRouter, linktreeRouter, noticeRouter, userRouter } from "./routes/index.js";

const port = 7070;
const corsOptions = {
  origin: "http://localhost:8080",
  credentials: true,
};

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const app = express();
console.log({__dirname, css: path.join(__dirname, `./${isRunOnDist ? '../' : ''}adminPage/components/css`)});
// app.get('/', async (req, res) => res.sendFile(__dirname + '/test.html'));
// app.get('/login', (req, res) => res.sendFile(__dirname + '/testLogin.html'));

AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
});

const start = async () => {
  const admin = new AdminJS(adminOptions);
  const adminRouter = mode == "development"
    ? AdminJSExpress.buildRouter(admin)
    : AdminJSExpress.buildAuthenticatedRouter(
        admin,
        {
          cookiePassword: "ss-cookie-pass",
          provider: authProvider,
        },
        null,
        {
          secret: "test",
          resave: false,
          saveUninitialized: true,
        }
      );
  // admin page router 설정
  // const adminRouter = AdminJSExpress.buildRouter(admin);
  // adminRouter 설정 전에 json, urlendcoded를 거치면 오류 발생함
  app.use(
    express.static(path.join(__dirname, `./${isRunOnDist ? '../' : ''}adminPage/components/css`))
  );
  app.use(express.static(path.join(__dirname + "/admin", `./${isRunOnDist ? '../' : ''}public`)));
  app.use(express.static(path.join(__dirname, `./${isRunOnDist ? '../' : ''}public`)));
  app.use(admin.options.rootPath, adminRouter);
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(json());
  app.use(urlencoded({ extended: false }));
  app.use("/api", noticeRouter);
  app.use("/api", userRouter);
  app.use("/api", eventRouter);
  app.use("/api", alarmRouter);
  app.use("/api", linktreeRouter);
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

  app.listen(port, () => {
    console.log(
      `AdminJS started on http://localhost:${port}${admin.options.rootPath}`
    );
  });
};
start();
