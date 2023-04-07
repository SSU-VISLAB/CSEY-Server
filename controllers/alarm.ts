import * as express from "express";
import { Alarm, DBAlarm } from "../models/alarm";

const validateValue = (key: keyof Alarm, value) => {
    if (value == undefined) return false;
    if (key == "events_timer") {
        return value >= 0 && value <= 24;
    } else {
        return value == "1" || value == "0";
    }
};

const validateKey = (key) => {
    const keys = [
        "alarm_push",
        "event_push",
        "events_timer",
        "events_post",
        "major_schedule_push",
        "major_schedule_post",
        "notice_push",
        "alerts_push",
    ];
    return keys.includes(key);
};

export const setAlarm = async ({params, body}: express.Request<any, any, Alarm>, res: express.Response, next: any) => {
    let { id } = params; // url에서 :id 부분 추출
    id = (await DBAlarm.findUser(id)).fk_id;
    if (!id) {
        return res.status(403).json({ status: "id error" });
    } // Alarms테이블에 id없음, 정상이면 안나오는 오류

    const key = Object.keys(body)[0] as keyof Alarm;
    const value = body[key];
    if (!validateKey(key) || !validateValue(key, value)) {
        return res.status(403).json({ status: "validation error" });
    } // 데이터 오류

    const result = await DBAlarm.updateOne(key, value, +id);
    if (result) {
        return res.status(200).json({ status: "ok" });
    } else {
        return res.status(400).json({ status: "sql execution error" });
    } // sql 처리가 잘못됨
};
