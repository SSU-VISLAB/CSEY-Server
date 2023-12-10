import * as express from "express";
import { Notice } from "../../models/index.ts";
import { INotice } from "../../models/types.js";
import { Op } from "sequelize";
import { redisClient } from "../../redis/redis_server.ts";

const EXPIRE = 3600; // 유효시간 1시간
const ALERT_EXPIRE = 60; // 유효시간 1분

// GET /posts/notices
export const getNoticeAll = async (
    req: express.Request<any, any>,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        let noticeList: INotice[] = [];

        // DB에서 전체 공지 개수 가져오기
        const totalNoticesInDb = await Notice.count();

        // Redis에서 전체 공지 개수 가져오기
        const keys = await redisClient.keys('notice:*');
        const totalNoticesInRedis = keys.length;

        if (totalNoticesInDb !== totalNoticesInRedis) {
            // DB와 Redis의 공지 개수가 동일하지 않으면 DB에서 데이터 가져오기
            const noticesDB = await Notice.findAll() as INotice[];

            // 각 공지를 Redis에 저장
            for (const notice of noticesDB) {
                const redisKey = `notice:${notice.id}`;
                await redisClient.set(redisKey, JSON.stringify(notice), { EX: EXPIRE }); 
                noticeList.push(notice);
            }
        } else {
            // Redis에서 모든 공지 가져오기
            for (const key of keys) {
                const notice = JSON.parse(await redisClient.get(key));
                noticeList.push(notice);
            }
        }

        return res.status(200).json(noticeList);
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
        const redisKey = 'alerts:emergency';
        let alertList: INotice[];

        // Redis에서 긴급 공지 목록을 먼저 조회
        let alertsRedis = await redisClient.get(redisKey);

        if (alertsRedis) {
            // Redis에 있는 경우, 캐시된 데이터 사용
            alertList = JSON.parse(alertsRedis);
        } else {
            // Redis에 없는 경우, DB에서 조회
            alertList = await Notice.findAll({
                where: {
                    priority: {
                        [Op.eq]: '긴급'
                    }
                }
            }) as INotice[];

            // 조회된 데이터를 Redis에 저장
            await redisClient.set(redisKey, JSON.stringify(alertList), { EX: ALERT_EXPIRE }); 
        }

        return res.status(200).json(alertList);
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