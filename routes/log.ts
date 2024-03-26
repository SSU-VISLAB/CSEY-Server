import { Router } from "express";
import { readLog } from "../controllers/common_method/readLog.js";

export const logRouter = Router();

logRouter.get('log', readLog);