import * as express from "express";
import Event from "../../models/events.ts";
import { IEvent } from "../../models/types.js";

// GET /posts/schedule
export const getSchedule=async(
    req: express.Request<any,any>,
    res: express.Response,
    next: express.NextFunction
)=>{
    try{
        const events=await Event.findAll() as IEvent[];
        const schedule = events.map(event => ({
            title: event.title,
            start: event.start,
            end: event.end,  
            major_advisor: event.major_advisor,
        }));        
        return res.status(200).json(schedule);
    } catch(error){
        console.error(error);
        res.status(500).json({ error: '서버 내부 에러' });
    }
}
