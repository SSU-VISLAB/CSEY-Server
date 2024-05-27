import * as express from "express";
import { Read, ReadAsset, sequelize } from "../../models/index.js";
import { redisClient } from "../../redis/connect.js";
import { getNoticeReadInfo } from "../common_method/user_information.js";
import { findObjectByPk, validateRequestBody } from "../common_method/validator.js";
import { INoticeUserRequest } from "./request/request.js";

const bodyList = [
    "notice_id",
    "user_id"
]

const EXPIRE = 3600; // 유효시간 1시간

// GET /users/read
export const getRead = async (
    { params, body }: express.Request<any, any, { user_id: string }>,
    res: express.Response,
    next: any
) => {
    try {
        // body값이 잘못됐는지 확인
        if (!validateRequestBody(body, ["user_id"])) {
            return res.status(404).json({ error: "잘못된 key 입니다." });
        }
        const {user_id} = body;

        // 해당 사용자의 Read 항목 찾기
        const read = await getNoticeReadInfo(user_id);
        return res.status(200).json(read);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "서버 내부 에러" });
    }
}

// POST /users/read
export const setRead = async (
    { params, body }: express.Request<any, any, INoticeUserRequest>,
    res: express.Response,
    next: any
) => {
    const transaction = await sequelize.transaction();
    try {
        // body값이 잘못됐는지 확인
        if (!validateRequestBody(body, bodyList)) {
            return res.status(404).json({ error: "잘못된 key 입니다." });
        }
        const { user_id, notice_id } = body;
        // DB에서 공지와 유저 찾기
        const errorMessage = await findObjectByPk(body);
        if (errorMessage) {
            return res.status(400).json({ error: errorMessage });
        }

        // Read 테이블이 생성되어 있는지 확인
        const read = await Read.findOne({
            where: { fk_user_id: user_id },
            include: [{model: ReadAsset, as: "ReadAssets"}],
            transaction
        });

        // ReadAsset 항목 추가
        await ReadAsset.create({
            fk_notice_id: notice_id,
            fk_read_id: read.id,
        }, { transaction, ignoreDuplicates: true });

        await transaction.commit();
        const list = read.ReadAssets.map(ra => ra.fk_notice_id.toString());
        if (!list.includes(notice_id)) list.push(notice_id.toString());
        // Redis에 있는 해당 사용자의 읽음 정보 업데이트
        await redisClient.sAdd(`user:noticeReads:${user_id}`, list);

        return res.status(200).json({ message: "읽음 설정 성공했습니다." });
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return res.status(500).json({ error: "서버 내부 에러" });
    }
};