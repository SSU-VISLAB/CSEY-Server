import * as express from "express";
import { Notice } from "../../models/index.js";
import { INotice } from "../../models/types.js";
import { redisClient } from "../../redis/redis_server.js";
import { redisGetAndParse } from "../common_method/utils.js";

const EXPIRE = 3600; // 유효시간 1시간
const ALERT_EXPIRE = 60; // 유효시간 1분

// GET /posts/notices
export const getNoticeAll = async (
    req: express.Request<any, any>,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const generalNoticeAll = await redisGetAndParse('alerts:general');
        return res.status(200).json(generalNoticeAll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 내부 에러' });
    }
}

// GET /posts/alerts
export const getAlertAll = async (
    req: express.Request<any, any>,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const urgentNoticeAll = await redisGetAndParse('alerts:urgent');
        return res.status(200).json(urgentNoticeAll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 내부 에러' });
    }
}

// GET /posts/notices/${noticeId} & /posts/alerts/${noticeId}
export const getNotice = async (
    req: express.Request<any, any>,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const noticeId = parseInt(req.params.noticeId, 10);
        const redisKey = `notice:${noticeId}`;
        let notice: INotice;

        // redis 먼저 조회
        let noticeByRedis = await redisClient.get(redisKey);

        if (noticeByRedis) {
            notice = JSON.parse(noticeByRedis);
        }
        else {
            // redis에 없는 경우, db 조회
            notice = await Notice.findByPk(noticeId) as INotice;

            if (notice) {
                await redisClient.set(redisKey, JSON.stringify(notice), { EX: EXPIRE });
            }
        }

        return res.status(200).json(notice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 내부 에러' });
    }
}