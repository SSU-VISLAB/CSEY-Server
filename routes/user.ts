import { Router } from "express";
import { verifyToken } from "../controllers/jwt/jwt.ts";
import { Kakao_login, deleteAccount, getRefreshToken, getUserData, logout, setMajor, getUserInfo } from "../controllers/user/index.ts";


const userRouter = Router();

/** url: /api/login */
userRouter.post('/login', Kakao_login);
userRouter.post('/logout', verifyToken, logout);

userRouter.post('/getToken', getRefreshToken);

userRouter.get('/users/info/:id', verifyToken, getUserInfo);

userRouter.get('/users/:id', getUserData);
userRouter.delete('/users/:id', verifyToken, deleteAccount);

userRouter.put('/users/:id/major', verifyToken, setMajor);

export default userRouter;