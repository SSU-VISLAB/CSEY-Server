import { Router } from "express";
import { getAlarms, setAlarm } from "../controllers/alarm/alarm.ts";
import { verifyToken } from "../controllers/jwt/index.ts";

const alarmRouter = Router();

alarmRouter.put('/:id/alarms', verifyToken, setAlarm);
alarmRouter.get('/:id/alarms', verifyToken, getAlarms);

export default alarmRouter;