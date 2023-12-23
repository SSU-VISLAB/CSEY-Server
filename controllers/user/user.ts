import express from 'express';
import User from '../../models/user.ts';
import { generate } from "../jwt/index.ts";
import { redisClient } from '../../redis/redis_server.ts';
import { getMajorInfo, getEventBookmarkInfo, getEventLikeInfo, getNoticeLikeInfo, getNoticeReadInfo } from '../common_method/index.ts'

type LoginSuccess = {
    accessToken: string;
    refreshToken: string;
}
type LoginFail = {
    error: string;
}

// POST /users/login
export const login = async (account: string): Promise<LoginSuccess | LoginFail> => {
    try {
        const { accessToken, refreshToken } = generate(account);
        await redisClient.set(`refreshToken:${refreshToken}`, 'true');
        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error);
        return { error: "토큰 생성 실패" };
    }
};

export const getUserData = async (req: express.Request, res: express.Response) => {
    console.log("params", req.params);
    try {
        const userId = req.params.id;
        const userData = await User.findOne({ where: { id: userId } });
        return res.status(200).json(userData);
    } catch (e) {
        console.error({ e });
    }
}

// DELETE /users/${userId}
export const deleteAccount = async (req: express.Request, res: express.Response) => {
    try {
        const userId = req.params.id;
        const userData = await User.findOne({ where: { id: userId } });

        if (userData) {
            await userData.destroy();
            return res.status(200).json({ message: "계정이 성공적으로 삭제되었습니다." });
        } else {
            return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
        }
    } catch (e) {
        console.log({ e });
        return res.status(500).json({ error: "서버 내부 에러" });
    }
}

// GET /users/info/data
export const getUserInfo = async (req: express.Request, res: express.Response) => {
    try {
        const userId = req.params.id;

        const userMajor = await getMajorInfo(userId);
        const userEventBookmark = await getEventBookmarkInfo(userId);
        const userEventLike = await getEventLikeInfo(userId);
        const userNoticeLike = await getNoticeLikeInfo(userId);
        const userNoticeRead = await getNoticeReadInfo(userId);
        const userInformation = {
            userMajor,
            userEventBookmark,
            userEventLike,
            userNoticeLike,
            userNoticeRead
        }

        return res.status(200).json({ userInformation });
    } catch (e) {
        console.log({ e });
        return res.status(500).json({ error: "서버 내부 에러" });
    }
}