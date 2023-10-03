import * as express from "express";
import { findObjectByPk, validateRequestBody } from "../common_method/validator.ts";
import User from "../../models/user.ts";

const bodyList = [
    "major"
]

// PUT users/${userId}/major
export const setMajor = async (
    { params, body }: express.Request<any, any, { major: string }>,
    res: express.Response,
    next: any
) => {
    try {
        // body값이 잘못됐는지 확인
        if (!validateRequestBody(body, bodyList)) {
            return res.status(404).json({ error: "잘못된 key 입니다." });
        }
        const userId = parseInt(params.userId,10);
        const major = body.major;

        // 유저 정보와 전공 확인
        const errorMessage = await findObjectByPk({ user_id: userId });
        if (errorMessage || (major !== "컴퓨터" && major !== "소프트")) {
            return res.status(400).json({ message: "해당 user를 찾지 못 했거나 전공은 COMPUTER 또는 SOFTWARE를 선택하지 않았습니다." });
        }

        // 전공 업데이트
        await User.update({ major: major }, { where: { id: userId } });

        return res.status(200).json({ message: "성공" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "서버 내부 에러" });
    }
}