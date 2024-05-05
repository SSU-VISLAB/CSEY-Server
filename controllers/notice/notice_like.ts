import * as express from "express";
import { Notice, NoticesLike, sequelize } from "../../models/index.js";
import { redisClient } from "../../redis/connect.js";
import { findObjectByPk, validateRequestBody } from "../common_method/validator.js";
import { INoticeUserRequest } from "./request/request.js";

const bodyList = [
    "notice_id",
    "user_id",
    "like"
]

const EXPIRE = 3600; // 유효시간 1시간

/**
 * 좋아요 상태 바꾸기
 * @param body "notice_id","user_id"
 * @param status 'like','dislike','null'
 */
async function updateLikeStatus(body: INoticeUserRequest) {
    const transaction = await sequelize.transaction();
    try {
        const { notice_id, user_id, like } = body;

        // DB에서 공지와 유저 찾기
        const errorMessage = await findObjectByPk(body);
        if (errorMessage) {
            return { error: errorMessage };
        }

        const [existingLike, created] = await NoticesLike.findOrCreate({
            where: {
                fk_notice_id: notice_id,
                fk_user_id: user_id
            },
            defaults: { // 새로 생성될 때 사용할 기본 값들
                like,
                fk_notice_id: +notice_id,
                fk_user_id: +user_id
            },
            transaction,
            logging: console.log
        });
        const prevLike = existingLike.like;
        const isSame = prevLike == like;
        const updatedNoticeLike = await existingLike.update(
            { like: !created && isSame ? null : like },
            { transaction, logging: console.log }
        );
        const notice = await Notice.findOne({ where: { id: notice_id }, transaction });
        if (created || prevLike == null) {
            await notice.increment(like, { transaction });
            notice[like]++;
        } else if (isSame) {
            await notice.decrement(like, { transaction });
            notice[like]--;
        } else if (!isSame) {
            await notice.increment(like, { transaction });
            await notice.decrement(prevLike, { transaction });
            notice[like]++;
            notice[prevLike]--;
        }
        await transaction.commit();
        // redis notice 업데이트
        await redisClient.set(`notice:${notice_id}`, JSON.stringify(notice));
        // Redis에 있는 해당 사용자의 공지사항 좋아요 정보 업데이트
        updatedNoticeLike.like
            ? await redisClient.hSet(`user:eventLikes:${user_id}`, notice_id, like)
            : await redisClient.hDel(`user:eventLikes:${user_id}`, notice_id.toString());
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

// PUT /posts/notices/like
export const setLike = async (
    { params, body }: express.Request<any, any, INoticeUserRequest>,
    res: express.Response,
    next: any
) => {
    try {
        // body값이 잘못됐는지 확인
        if (!validateRequestBody(body, bodyList)) {
            return res.status(404).json({ error: "잘못된 key 입니다." });
        }

        const result = await updateLikeStatus(body);
        if (result && result.error) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json({ message: "좋아요 설정 성공했습니다." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "서버 내부 에러" });
    }
};
