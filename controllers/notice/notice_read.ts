import * as express from "express";
import { INoticeUserRequest } from "./request/request.js";
import { findObjectByPk, findUser, validateRequestBody } from "../common_method/validator.js";
import { Notice, Read, ReadAsset, sequelize } from "../../models/index.js";
import { IRead, IReadAsset } from "../../models/types.js";
import { Op } from "sequelize";
import { redisClient } from "../../redis/connect.js";
import { getNoticeReadInfo } from "../common_method/user_information.js";

const bodyList = [
    "notice_id",
    "user_id"
]

const EXPIRE = 3600; // 유효시간 1시간

// GET /users/read
export const getUnread = async (
    { params, body }: express.Request<any, any, { user_id: number }>,
    res: express.Response,
    next: any
) => {
    try {
        // body값이 잘못됐는지 확인
        if (!validateRequestBody(body, ["user_id"])) {
            return res.status(404).json({ error: "잘못된 key 입니다." });
        }
        const user_id = body.user_id;

        // DB에서 유저 찾기
        await findUser(user_id);

        // 해당 사용자의 Read 항목 찾기
        const read = await Read.findOne({ where: { fk_user_id: user_id } }) as IRead | null;

        if (!read) {
            // Read 항목이 없으면 모든 공지 반환
            const allNotices = await Notice.findAll();
            return res.status(200).json(allNotices);
        } else {
            // ReadAsset 테이블에서 읽은 공지 목록 찾기
            const readAssetsList = await ReadAsset.findAll({
                where: { fk_read_id: read.id },
                attributes: ['fk_notice_id']
            }) as IReadAsset[];
            const readNoticeIds = readAssetsList.map(asset => asset.fk_notice_id);

            // 읽지 않은 공지 찾기
            const unreadNotices = await Notice.findAll({
                where: { id: { [Op.notIn]: readNoticeIds } }
            });
            return res.status(200).json(unreadNotices);
        }
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
        let read = await Read.findOne({ where: { fk_user_id: user_id } }) as IRead | null;

        // Read 테이블 생성이 안되어 있다면 새로 생성
        if (!read) {
            read = await Read.create({ fk_user_id: user_id }, { transaction }) as IRead;
        }

        // 해당 ReadAsset 항목이 이미 있는지 확인
        const existingReadAsset = await ReadAsset.findOne({
            where: {
                fk_notice_id: notice_id,
                fk_read_id: read.id
            }
        });

        // ReadAsset 항목이 존재하지 않으면 추가
        if (!existingReadAsset) {
            await ReadAsset.create({
                fk_notice_id: notice_id,
                fk_read_id: read.id,
            }, { transaction });
        }

        await transaction.commit();

        // Redis에 있는 해당 사용자의 읽음 정보 업데이트
        const updatedReadAssets = await getNoticeReadInfo(user_id.toString());
        await redisClient.set(`user:read:${user_id}`, JSON.stringify(updatedReadAssets), { EX: EXPIRE });

        return res.status(200).json({ message: "읽음 설정 성공했습니다." });
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        return res.status(500).json({ error: "서버 내부 에러" });
    }
};