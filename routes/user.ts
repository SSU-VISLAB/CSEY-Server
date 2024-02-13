import { Router } from "express";
import { verifyToken } from "../controllers/jwt/jwt.js";
import { Kakao_login, deleteAccount, getRefreshToken, getUserInfo, logout, setMajor } from "../controllers/user/index.js";


const userRouter = Router();

/** url: /api/login */
userRouter.post('/login', Kakao_login);
userRouter.post('/logout', verifyToken, logout);

userRouter.post('/getToken', getRefreshToken);

userRouter.get('/users/info/:id', verifyToken, getUserInfo);

userRouter.delete('/users/:id', verifyToken, deleteAccount);

userRouter.put('/users/:id/major', verifyToken, setMajor);

export default userRouter;