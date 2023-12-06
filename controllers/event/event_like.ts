import * as express from "express";
import { IEventUserRequest } from "./request/request.js";
import { EventsLike,sequelize } from "../../models/index.ts";
import { findObjectByPk, validateRequestBody } from "../common_method/validator.ts";

const bodyList = [
    "event_id",
    "user_id",
];

/**
 * 좋아요 상태 바꾸기
 * @param body "event_id","user_id",
 * @param status 'like','dislike','null'
 */
async function updateLikeStatus(body: IEventUserRequest, status: { like: string }) {
    const transaction = await sequelize.transaction();
    try {
        const { event_id, user_id } = body;

        // DB에서 행사와 유저 찾기
        const errorMessage = await findObjectByPk(body);
        if (errorMessage) {
            return { error: errorMessage };
        }

        const existingLike = await EventsLike.findOne({
            where: { fk_event_id: event_id, fk_user_id: user_id },
            transaction,
            logging: console.log,
        });

        console.log(existingLike);
        if (existingLike) {
            console.log("whswogkqslek");
            await existingLike.update(status, { transaction, logging: console.log});
        } else {
            console.log("dkswhswogkqslek");
            await EventsLike.create({
                ...status,
                fk_event_id: event_id,
                fk_user_id: user_id
            }, { transaction,logging: console.log });
        }

        await transaction.commit();
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
            return res.status(404).json({ error: "잘못된 key 입니다." });
        }

        const result = await updateLikeStatus(body, { like: 'like' });
        if (result && result.error) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json({ message: "좋아요 설정 성공했습니다." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "서버 내부 에러" });
    }
};

// PUT /posts/events/dislike
export const setDisLike = async (
    { params, body }: express.Request<any, any, IEventUserRequest>,
    res: express.Response,
    next: any
) => {
    try {
        // body값이 잘못됐는지 확인
        if (!validateRequestBody(body, bodyList)) {
            return res.status(404).json({ error: "잘못된 key 입니다." });
        }

        const result = await updateLikeStatus(body, { like: 'dislike' });
        if (result && result.error) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json({ message: "싫어요 설정 성공했습니다." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "서버 내부 에러" });
    }
};

// DELETE /posts/events/like  &  /posts/events/dislike
export const deleteLike = async (
    { params, body }: express.Request<any, any, IEventUserRequest>,
    res: express.Response,
    next: any
) => {
    try {
        const result = await updateLikeStatus(body, { like: 'null' });
        if (result && result.error) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json({ message: "좋아요 삭제를 성공했습니다." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "서버 내부 에러" });
    }
};