import * as express from "express";
import { Event } from "../../models/index.ts";
import { IEvent } from "../../models/types.js";
import { redisClient } from "../../redis/redis_server.ts";

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
        let eventAll: IEvent[] = [];
        const redisKey = 'allEvents';

        // Redis에서 전체 이벤트 개수 가져오기
        const keys = await redisClient.keys('event:*');
        const totalEventsInRedis = keys.length;

        // DB에서 전체 이벤트 개수 가져오기
        const totalEventsInDb = await Event.count();

        if (totalEventsInDb !== totalEventsInRedis) {
            // DB와 Redis의 이벤트 개수가 다른 경우
            const eventsFromDb = await Event.findAll() as IEvent[];

            // 각 이벤트를 Redis에 저장
            for (const event of eventsFromDb) {
                const eventRedisKey = `event:${event.id}`;
                await redisClient.set(eventRedisKey, JSON.stringify(event), { EX: EXPIRE });
                eventAll.push(event);
            }

            // 전체 목록 Redis에 저장
            await redisClient.set(redisKey, JSON.stringify(eventAll), { EX: EXPIRE });
        } else {
            // Redis에서 모든 이벤트 가져오기
            eventAll = JSON.parse(await redisClient.get(redisKey));
        }

        return res.status(200).json(eventAll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 내부 에러' });
    }
}