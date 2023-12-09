import { Router } from "express";
import { verifyToken } from "../controllers/jwt/jwt.ts";
import { Kakao_login, deleteAccount, getRefreshToken, getUserData, logout, setMajor } from "../controllers/user/index.ts";


const userRouter = Router();

/** url: /api/login */
userRouter.post('/login', Kakao_login);
userRouter.post('/logout', verifyToken, logout);

userRouter.post('/getToken', getRefreshToken);

userRouter.get('/users/:id', verifyToken, getUserData);
userRouter.delete('/users/:id', verifyToken, deleteAccount);

userRouter.put('/users/:id/major', verifyToken, setMajor);

export default userRouter;