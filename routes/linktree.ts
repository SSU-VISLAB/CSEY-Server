import { Router } from "express";
import { getLinktrees } from "../controllers/linktree/index.js";

const linktreeRouter = Router();

// ex) /api/linktree/컴퓨터
linktreeRouter.get('/linktree/:major_advisor', getLinktrees);

export default linktreeRouter;