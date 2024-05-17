import express from 'express';
import User from '../../models/user.js';
import { redisClient } from '../../redis/connect.js';
import { getEventBookmarkInfo, getEventLikeInfo, getNoticeLikeInfo, getNoticeReadInfo } from '../common_method/index.js';
import { getAlarmInfo } from '../common_method/user_information.js';
import { generate } from "../jwt/index.js";

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
        const [alarm, bookmark, eventLike, noticeLike, noticeRead] = await Promise.all([
            getAlarmInfo(userId),
            getEventBookmarkInfo(userId),
            getEventLikeInfo(userId),
            getNoticeLikeInfo(userId),
            getNoticeReadInfo(userId)
        ])
        const userInformation = {
            alarm,
            bookmark,
            eventLike,
            noticeLike,
            noticeRead
        }

        return res.status(200).json(userInformation);
    } catch (e) {
        return res.status(500).json({ error: "서버 내부 에러", message: e });
    }
}