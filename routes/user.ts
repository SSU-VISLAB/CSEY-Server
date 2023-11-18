import { Router } from "express";
import * as alarmController from "../controllers/alarm/alarm.ts";
import { verifyToken } from "../controllers/jwt/jwt.ts";
import * as userController from "../controllers/user/auth.ts";


const userRouter = Router();

/** url: /api/login */
userRouter.post('/login', userController.Kakao_login);
userRouter.post('/logout', verifyToken, userController.logout);

userRouter.post('/getToken', userController.getRefreshToken);

userRouter.put('/:id/alarms', verifyToken, alarmController.setAlarm);

export default userRouter;