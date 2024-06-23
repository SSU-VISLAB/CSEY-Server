import * as express from "express";
import { FCMToken, sequelize } from "../../models/index.js";
import { IAlarm } from "../../models/types.js";
import { getEventBookmarkInfo } from "../common_method/user_information.js";
import { subscribeTopic, unsubscribeTopic } from "./index.js";

const alarmDataKeyList = [
  "id",
  "alarm_push",
  "event_push",
  "events_timer",
  "events_form",
  "events_post",
  "major_schedule_push",
  "major_schedule_post",
  "notice_push",
  "alerts_push",
  "fk_user_id"
];

type SetAlarmBody = {
  alarmData: string;
  fcmToken: string;
}
// PUT /users/:id/alarms/set
export const setAlarm = async (
  { params, body }: express.Request<any, any, SetAlarmBody>,
  res: express.Response,
) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = params.id;
    const alarmData: IAlarm = JSON.parse(body.alarmData);
    const token = body.fcmToken;
    // body값이 잘못됐는지 확인
    const alarmDataKeys = Object.keys(alarmData);
    if (alarmDataKeys.some((key) => !alarmDataKeyList.includes(key))) {
      return res.status(401).json({ error: "잘못된 key 입니다." });
    }
    const topics = await getTopics(userId, alarmData);

    const [fcmToken, created] = await FCMToken.findOrCreate({
      where: { fk_user_id: +userId, token },
      defaults: { fk_user_id: +userId, token, topics, timer: alarmData.events_timer },
      transaction,
    });
    // created면 토픽 등록
    if (created) {
      for (const topic of topics) {
        subscribeTopic(token, topic);
      }
    } else { // 수정이면 토픽 등록도 수정
      const before = fcmToken.topics;
      const after = topics;
      await fcmToken.update({ topics, timer: alarmData.events_timer }, {
        transaction
      });
      const { added, removed } = findDifferences(before, after);
      for (const topic of added) {
        subscribeTopic(token, topic);
      }
      for (const topic of removed) {
        unsubscribeTopic(token, topic);
      }
    }
    await transaction.commit();

    return res.status(200).json({ message: "알람 설정이 업데이트되었습니다." });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ error });
  }
};

async function getTopics(userId: string, alarmData: IAlarm) {
  const {
    event_push, events_timer, events_form
  } = alarmData;
  const topicsFrom = Object.entries(alarmData).filter(([key, value]) => {
    return (key.includes('push') || key.includes('post')) && value;
  });
  let bookmarks: string[];
  if (event_push) {
    bookmarks = await getEventBookmarkInfo(userId);
  }
  const topics = topicsFrom.reduce((acc: string[], [key]) => {
    if (key === 'event_push') {
      if (events_form == '전체') {
        acc.push(`event_${events_timer}`);
      } else {
        acc.push(...bookmarks.map((bookmark) => `event:${bookmark}_${events_timer}`));
      }
    } else {
      acc.push(key);
    }
    return acc;
  }, []);
  return topics;
}

function findDifferences(before: string[], after: string[]) {
  const removed = before.filter(item => !after.includes(item));
  const added = after.filter(item => !before.includes(item));
  return { added, removed };
}