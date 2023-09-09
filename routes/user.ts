import { Router } from "express";
import * as alarmController from "../controllers/alarm";
import * as userController from "../controllers/user";


const userRouter = Router();
/** url: /api/signup */
userRouter.post('/signup', userController.signup);

/** url: /api/login */
userRouter.post('/login', userController.login);

userRouter.put('/:id/alarms', alarmController.setAlarm);

export default userRouter;