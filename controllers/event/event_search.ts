import * as express from "express";
import { Event } from "../../models/index.ts";
import { IEvent } from "../../models/types.js";

// GET /posts/events/${행사글id}
export const getEvent = async (
    req: express.Request<any, any>,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findByPk(eventId) as IEvent;

        if (!event) {
            return res.status(400).json({ message: "해당 행사를 찾을 수 없습니다." });
        }

        return res.status(200).json(event);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "서버 내부 에러" });
    }
};

// GET /events
export const getEventAll = async (
    req: express.Request<any, any>,
    res: express.Response,
    next: express.NextFunction
) => {
    try {
        const eventAll = await Event.findAll() as IEvent[];

        return res.status(200).json(eventAll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 내부 에러' });
    }
}