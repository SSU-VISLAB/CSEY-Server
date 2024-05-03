import * as express from "express";
import { Event, EventsLike, sequelize } from "../../models/index.js";
import { redisClient } from "../../redis/connect.js";
import { findObjectByPk, validateRequestBody } from "../common_method/validator.js";
import { IEventUserRequest } from "./request/request.js";

const bodyList = [
    "event_id",
    "user_id",
    "like"
];

const EXPIRE = 3600; // 유효시간 1시간

/**
 * 좋아요 상태 바꾸기
 * @param body "event_id","user_id",
 * @param status 'like','dislike','null'
 */
async function updateLikeStatus(body: IEventUserRequest) {
    const transaction = await sequelize.transaction();
    try {
        const { event_id, user_id, like } = body;

        // DB에서 행사와 유저 찾기
        const errorMessage = await findObjectByPk(body);
        if (errorMessage) {
            return { error: errorMessage };
        }

        const [existingLike, created] = await EventsLike.findOrCreate({
            where: {
                fk_event_id: event_id,
                fk_user_id: user_id
            },
            defaults: { // 새로 생성될 때 사용할 기본 값들
                like,
                fk_event_id: event_id,
                fk_user_id: user_id
            },
            transaction,
            logging: console.log
        });
        const prevLike = existingLike.like;
        const isSame = prevLike == like;
        const updatedEventLike = await existingLike.update(
            { like: (!created && isSame) ? null : like },
            { transaction, logging: console.log }
        );
        const event = await Event.findOne({ where: { id: event_id }, transaction });
        if (created || prevLike == null) {
            await event.increment(like, { transaction });
            event[like]++;
        } else if (isSame) {
            await event.decrement(like, { transaction });
            event[like]--;
        } else if (!isSame) {
            await event.increment(like, { transaction });
            await event.decrement(prevLike, { transaction });
            event[like]++;
            event[prevLike]--;
        }
        await transaction.commit();
        // redis event 업데이트
        await redisClient.set(`event:${event_id}`, JSON.stringify(event));
        // Redis에 있는 해당 사용자의 이벤트 좋아요 정보 업데이트
        updatedEventLike.like
            ? await redisClient.hSet(`user:eventLikes:${user_id}`, event_id, like)
            : await redisClient.hDel(`user:eventLikes:${user_id}`, event_id.toString());
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        throw error;  // Re-throw the error after rolling back
    }
}

// PUT /posts/events/like
export const setLike = async (
    { params, body }: express.Request<any, any, IEventUserRequest>,
    res: express.Response,
    next: any
) => {
    try {
        // body값이 잘못됐는지 확인
        if (!validateRequestBody(body, bodyList)) {
            return res.status(404).json({ error: "잘못된 key 입니다.", body, bodyList });
        }

        const result = await updateLikeStatus(body);
        if (result && result.error) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json({ message: `like: ${body.like} 설정 성공했습니다.` });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "서버 내부 에러" });
    }
};