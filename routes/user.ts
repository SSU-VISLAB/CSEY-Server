import { Router } from "express";
import * as userController from "../controllers/user";
import * as alarmController from "../controllers/alarm";


const userRouter = Router();
/** url: /api/signup */
userRouter.post('/signup', userController.signup);

/** url: /api/login */
userRouter.post('/login', userController.login);

userRouter.put('/:id/alarms/set', alarmController.setAlarm);

export default userRouter;