import * as express from "express";
import { Alarm, User } from "../../models/index.js";
import { IAlarm } from "../../models/types.js";
import { redisClient } from "../../redis/connect.js";

const bodyList = [
  "alarm_push",
  "event_push",
  "events_timer",
  "events_post",
  "major_schedule_push",
  "major_schedule_post",
  "notice_push",
  "alerts_push",
  "fk_id",
];

// PUT /users/:id/alarms/set
export const setAlarm = async (
  { params, body }: express.Request<any, any, IAlarm>,
  res: express.Response,
  next: any
) => {
  try {
    const userId = params.id;
    const alarms = body;

    // body값이 잘못됐는지 확인
    const keys = Object.keys(body);
    if (keys.some((key) => !bodyList.includes(key))) {
      return res.status(404).json({ error: "잘못된 key 입니다." });
    }

    // 데이터베이스에서 해당 사용자를 찾음
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    // 사용자의 알람 설정 업데이트
    const userAlarms: any = await Alarm.update(alarms, {
      where: { fk_user_id: userId },
      individualHooks: true,
    });
    const redisKey = `user:alarm:${userId}`;
    await redisClient.set(redisKey, JSON.stringify(userAlarms[1][0]), { EX: 3600 });

    return res.status(200).json({ message: "알람 설정이 업데이트되었습니다." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};
