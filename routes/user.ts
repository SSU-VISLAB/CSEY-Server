import express from "express";
import * as userController from "../controllers/user";

const userRouter = express.Router();
/** url: /api/signup */
userRouter.post('/signup', userController.signup);

/** url: /api/login */
userRouter.post('/login', userController.login);

export default userRouter;