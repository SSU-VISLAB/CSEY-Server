import * as express from "express";
import { IEventUserRequest } from "./request/request.ts";
import { IBookmark } from "../../models/types.js";
import { Bookmark, BookmarkAsset, sequelize } from "../../models/index.ts";
import { findObjectByPk, validateRequestBody } from "../common_method/index.ts";

const bodyList = [
    "event_id",
    "user_id",
]

// POST /users/bookmark
export const setBookmark = async (
    { params, body }: express.Request<any, any, IEventUserRequest>,
    res: express.Response,
    next: any
) => {
    const transaction = await sequelize.transaction();
    try {
        // body값이 잘못됐는지 확인
        if (!validateRequestBody(body, bodyList)) {
            return res.status(404).json({ error: "잘못된 key 입니다." });
        }
        const { user_id, event_id } = body;

        // DB에서 행사와 유저 찾기
        const errorMessage = await findObjectByPk(body);
        if (errorMessage) {
            return res.status(400).json({ error: errorMessage });
        }

        // 북마크에 이미 추가되어 있는지 확인
        let bookmark = await Bookmark.findOne({ where: { fk_user_id: user_id } }) as IBookmark | null;

        // 북마크가 없다면 새로 생성
        if (!bookmark) {
            bookmark = await Bookmark.create({ fk_user_id: user_id }, { transaction }) as IBookmark;
        }

        // BookmarkAsset 테이블에 항목 추가
        await BookmarkAsset.create({
            fk_event_id: event_id,
            fk_bookmark_id: bookmark.id,
        }, { transaction });

        await transaction.commit();

        return res.status(200).json({ message: "북마크 설정 성공했습니다." });
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        return res.status(500).json({ error: "서버 내부 에러" });
    }
};

// DELETE /users/bookmark
export const deleteBookmark = async (
    { params, body }: express.Request<any, any, IEventUserRequest>,
    res: express.Response,
    next: any
) => {
    const transaction = await sequelize.transaction();
    try {
        // body값이 잘못됐는지 확인
        if (!validateRequestBody(body, bodyList)) {
            return res.status(404).json({ error: "잘못된 key 입니다." });
        }
        const { user_id, event_id } = body;

        // DB에서 공지와 유저 찾기
        const errorMessage = await findObjectByPk(body);
        if (errorMessage) {
            return res.status(400).json({ error: errorMessage });
        }

        // 북마크에 이미 추가되어 있는지 확인
        const bookmark = await Bookmark.findOne({ where: { fk_user_id: user_id } }) as IBookmark | null;

        if (bookmark) {
            // BookmarkAsset 테이블 삭제
            await BookmarkAsset.destroy({
                where: {
                    fk_bookmark_id: bookmark.id,
                    fk_event_id: event_id
                },
                transaction: transaction
            });

            // Bookmark 테이블 삭제
            await Bookmark.destroy({
                where: {
                    id: bookmark.id
                },
                transaction: transaction
            });
        }

        await transaction.commit();

        return res.status(200).json({ message: "북마크 삭제 성공했습니다." });
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        return res.status(500).json({ error: "서버 내부 에러" });
    }
};