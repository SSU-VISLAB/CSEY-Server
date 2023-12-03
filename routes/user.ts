import { Router } from "express";
import { verifyToken } from "../controllers/jwt/jwt.ts";
import { Kakao_login, getRefreshToken, getUserData, logout } from "../controllers/user/index.ts";


const userRouter = Router();

/** url: /api/login */
userRouter.post('/login', Kakao_login);
userRouter.post('/logout', verifyToken, logout);

userRouter.post('/getToken', getRefreshToken);

userRouter.get('/users/:id', verifyToken, getUserData);

export default userRouter;