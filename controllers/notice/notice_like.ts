import * as express from "express";
import { INoticeUserRequest } from "./request/request.ts";
import User from "../../models/user.ts";
import Notice from "../../models/notice.ts";
import NoticesLike from "../../models/notices_like.ts";
import { sequelize } from "../../models/sequelize.ts";
import { validateRequestBody } from "../common_method/validator.ts";

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

        await findUserAndNotice(body);

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
        const keys = Object.keys(body);
        if(!validateRequestBody(body,bodyList)){
            return res.status(404).json({error:"잘못된 key 입니다."});
        }

        await updateLikeStatus(body,{like:'like'});
        return res.status(200).json({message:"좋아요 설정 성공했습니다."});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:"서버 내부 에러"});
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
        const keys = Object.keys(body);
        if (!validateRequestBody(body,bodyList)) {
            return res.status(404).json({ error: "잘못된 key 입니다." });
        }

        await updateLikeStatus(body, {like: 'dislike'});
        return res.status(200).json({message:"싫어요 설정 성공했습니다."});
    } catch(error){
        console.log(error);
        return res.status(500).json({error:"서버 내부 에러"});
    }
};

// DELETE /posts/notices/like  &  /posts/notices/dislike
export const deleteLike = async (
    { params, body }: express.Request<any, any, INoticeUserRequest>,
    res: express.Response,
    next: any
) => {
    try {
        await updateLikeStatus(body, {like: 'null'});
        return res.status(200).json({message:"좋아요 삭제를 성공했습니다."});
    } catch(error){
        console.log(error);
        return res.status(500).json({error:"서버 내부 에러"});
    }
};


async function findUserAndNotice(body: INoticeUserRequest) {
    const notice = await Notice.findByPk(body.notice_id);
    const user = await User.findByPk(body.user_id);

    const errors = [];
    if (!user) {
        errors.push("사용자를 찾을 수 없습니다.");
    }
    if (!notice) {
        errors.push("공지를 찾을 수 없습니다.");
    }
    if (errors.length > 0) {
        throw new Error(errors.join(" "));
    }
}