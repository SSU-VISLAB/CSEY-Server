import * as express from "express";
import Notice from "../../models/notice.ts";
import { INotice } from "../../models/types.js";
import { Op } from "sequelize";

const bodyList=[
    "id",
    "title",
    "content",
    "image",
    "date",
    "major_advisor",
    "like",
    "dislike",
    "priority"
];

// GET /posts/notices
export const getNoticeAll=async(
    req: express.Request<any,any>,
    res: express.Response,
    next: express.NextFunction
)=>{
    try{
        const noticeList=await Notice.findAll() as INotice[];

        validateNoticeObjects(noticeList);

        return res.status(200).json(noticeList);
    } catch(error){
        console.error(error);
        res.status(500).json({ error: '서버 내부 에러' });
    }
}

// GET /posts/alerts
export const getAlertAll=async(
    req: express.Request<any,any>,
    res: express.Response,
    next: express.NextFunction
)=>{
    try{
        // priority가 'EMERGENCY'인 공지만 찾기
        const alertList = await Notice.findAll({
            where: {
                priority: {
                    [Op.eq]: 'EMERGENCY'
                }
            }
        }) as INotice[];
        validateNoticeObjects(alertList);  // 각 공지사항 객체를 검증합니다.
        return res.status(200).json(alertList);
    } catch(error){
        console.error(error);
        res.status(500).json({ error: '서버 내부 에러' });
    }
}

// GET /posts/notices/${공지글id} & /posts/alerts/${공지글id}
export const getNotice=async(
    req: express.Request<any,any>,
    res: express.Response,
    next: express.NextFunction
)=>{
    try{
        const noticeId=req.params.notice_id;
        const notice=await Notice.findByPk(noticeId) as INotice;

        validateNoticeObject(notice);

        return res.status(200).json(notice);
    } catch(error){
        console.error(error);
        res.status(500).json({ error: '서버 내부 에러' });
    }
}

// 공지사항 객체 검증
const validateNoticeObject = (obj: INotice): void => {
    const keys = Object.keys(obj);
    const missingKeys = bodyList.filter(key => !keys.includes(key));
    if (missingKeys.length > 0) {
        throw new Error(`Missing required keys: ${missingKeys.join(", ")}`);
    }
};

// 모든 공지사항 객체를 검증하는 함수
const validateNoticeObjects = (notices: INotice[]): void => {
    for (const notice of notices) {
        validateNoticeObject(notice);
    }
};