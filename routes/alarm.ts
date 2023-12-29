import { Router } from "express";
import { setAlarm } from "../controllers/alarm/alarm.ts";
import { verifyToken } from "../controllers/jwt/index.ts";

const alarmRouter = Router();

alarmRouter.put('/:id/alarms', verifyToken, setAlarm);

export default alarmRouter;