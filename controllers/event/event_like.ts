import * as express from "express";
import { IEventUserRequest } from "./request/request.js";
import User from "../../models/user.ts"; 
import Event from "../../models/events.ts"; 
import EventsLike from "../../models/events_like.ts";
import { sequelize } from "../../models/sequelize.ts";

const bodyList=[
    "event_id",
    "user_id",
];

/**
 * 좋아요 상태 바꾸기
 * @param body "event_id","user_id",
 * @param status 'like','dislike','null'
 */
async function updateLikeStatus(body: IEventUserRequest, status: string) {
    const transaction = await sequelize.transaction();
    try {
        await findUserAndEvent(body);

        const existingLike = await EventsLike.findOne({
            where: {fk_event_id: body.event_id, fk_user_id: body.user_id},
            transaction
        });
        
        if(existingLike) {
            await existingLike.update({like: status}, {transaction});
        } else {
            await EventsLike.create({
                like: status,
                fk_event_id: body.event_id,
                fk_user_id: body.user_id
            }, {transaction});
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
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
        const keys = Object.keys(body);
        if (keys.some((key) => !bodyList.includes(key))) {
            return res.status(404).json({ error: "잘못된 key 입니다." });
        }

        await updateLikeStatus(body, 'like');
        return res.status(200).json({message:"좋아요 설정 성공했습니다."});
    } catch(error){
        console.log(error);
        return res.status(500).json({error:"서버 내부 에러"});
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
        const keys = Object.keys(body);
        if (keys.some((key) => !bodyList.includes(key))) {
            return res.status(404).json({ error: "잘못된 key 입니다." });
        }

        await updateLikeStatus(body, 'dislike');
        return res.status(200).json({message:"싫어요 설정 성공했습니다."});
    } catch(error){
        console.log(error);
        return res.status(500).json({error:"서버 내부 에러"});
    }
};

// DELETE /posts/events/like
export const deleteLike = async (
    { params, body }: express.Request<any, any, IEventUserRequest>,
    res: express.Response,
    next: any
) => {
    try {
        await updateLikeStatus(body, 'null');
        return res.status(200).json({message:"좋아요 삭제를 성공했습니다."});
    } catch(error){
        console.log(error);
        return res.status(500).json({error:"서버 내부 에러"});
    }
};

// DELETE /posts/events/dislike
export const deleteDisLike = async (
    { params, body }: express.Request<any, any, IEventUserRequest>,
    res: express.Response,
    next: any
) => {
    try {
        await updateLikeStatus(body, 'null');
        return res.status(200).json({message:"좋아요 삭제를 성공했습니다."});
    } catch(error){
        console.log(error);
        return res.status(500).json({error:"서버 내부 에러"});
    }
};

async function findUserAndEvent(body: IEventUserRequest) {
    const event = await Event.findByPk(body.event_id);
    const user = await User.findByPk(body.user_id);

    if (!user || !event) {
        throw new Error(!user ? "사용자를 찾을 수 없습니다." : "공지를 찾을 수 없습니다.");
    }
}