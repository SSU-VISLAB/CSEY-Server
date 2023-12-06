import * as express from "express";
import { Notice } from "../../models/index.ts";
import { INotice } from "../../models/types.js";
import { Op } from "sequelize";

// GET /posts/notices
export const getNoticeAll = async (
    req: express.Request<any, any>,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const noticeList = await Notice.findAll() as INotice[];

        return res.status(200).json(noticeList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 내부 에러' });
    }
}

// GET /posts/alerts
export const getAlertAll = async (
    req: express.Request<any, any>,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        // priority가 'EMERGENCY'인 공지만 찾기
        const alertList = await Notice.findAll({
            where: {
                priority: {
                    [Op.eq]: '긴급'
                }
            }
        }) as INotice[];

        return res.status(200).json(alertList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 내부 에러' });
    }
}

// GET /posts/notices/${noticeId} & /posts/alerts/${noticeId}
export const getNotice = async (
    req: express.Request<any, any>,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const noticeId = parseInt(req.params.noticeId, 10);
        const notice = await Notice.findByPk(noticeId) as INotice;

        return res.status(200).json(notice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 내부 에러' });
    }
}