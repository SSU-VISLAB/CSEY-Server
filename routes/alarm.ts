import { Router } from "express";
import { setAlarm } from "../controllers/alarm/index.js";
import { verifyToken } from "../controllers/jwt/index.js";

const alarmRouter = Router();

alarmRouter.put('/:id/alarms', verifyToken, setAlarm);

export default alarmRouter;