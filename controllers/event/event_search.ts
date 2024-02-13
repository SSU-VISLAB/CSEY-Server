import * as express from "express";
import { Event } from "../../models/index.js";
import { IEvent } from "../../models/types.js";
import { redisClient } from "../../redis/redis_server.js";
import { redisGetAndParse } from "../common_method/utils.js";

const EXPIRE = 3600; // 유효시간 1시간

// GET /posts/events/${행사글id}
export const getEvent = async (
    req: express.Request<any, any>,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const eventId = req.params.eventId;
        const redisKey = `event:${eventId}`;
        let event: IEvent;

        // Redis 먼저 조회
        const eventRedis = await redisClient.get(redisKey);

        if (eventRedis) {
            event = JSON.parse(eventRedis);
        }
        else {
            // Redis에 없는 경우, DB에서 조회
            event = await Event.findByPk(eventId) as IEvent;

            if (event) {
                await redisClient.set(redisKey, JSON.stringify(event), { EX: EXPIRE });
            } else {
                return res.status(400).json({ message: "해당 행사를 찾을 수 없습니다." });
            }
        }

        return res.status(200).json(event);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "서버 내부 에러" });
    }
};

// GET /events
export const getEventAll = async (
    req: express.Request<any, any>,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const eventAll = await redisGetAndParse('allEvents');
        return res.status(200).json(eventAll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 내부 에러' });
    }
}