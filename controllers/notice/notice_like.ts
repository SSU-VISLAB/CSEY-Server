import * as express from "express";
import { INoticeUserRequest } from "./request/request.ts";
import { NoticesLike, sequelize } from "../../models/index.ts";
import { findObjectByPk, validateRequestBody } from "../common_method/validator.ts";

const bodyList = [
    "notice_id",
    "user_id",
]

/**
 * 좋아요 상태 바꾸기
 * @param body "notice_id","user_id"
 * @param status 'like','dislike','null'
 */
async function updateLikeStatus(body: INoticeUserRequest, status: { like: string }) {
    const transaction = await sequelize.transaction();
    try {
        const { notice_id, user_id } = body;

        // DB에서 공지와 유저 찾기
        const errorMessage = await findObjectByPk(body);
        if (errorMessage) {
            return { error: errorMessage };
        }

        const existingLike = await NoticesLike.findOne({
            where: { fk_notice_id: notice_id, fk_user_id: user_id },
            transaction
        });

        if (existingLike) {
            await existingLike.update(status, { transaction });
        } else {
            await NoticesLike.create({
                ...status,
                fk_notice_id: notice_id,
                fk_user_id: user_id,
            }, { transaction });
        }

        await transaction.commit();
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

// PUT /posts/notices/dislike
export const setDisLike = async (
    { params, body }: express.Request<any, any, INoticeUserRequest>,
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

// DELETE /posts/notices/like  &  /posts/notices/dislike
export const deleteLike = async (
    { params, body }: express.Request<any, any, INoticeUserRequest>,
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