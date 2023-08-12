import * as express from "express";
import { Alarm, DBAlarm } from "../models/alarm";
import admin from "firebase-admin";
import path from "path";
import * as fs from "fs/promises"; // 파일 시스템 모듈
import { Message } from "firebase-admin/lib/messaging/messaging-api";

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

export const setAlarm = async (
  { params, body }: express.Request<any, any, Alarm>,
  res: express.Response,
  next: any
) => {
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

let deviceToken = `fYge-PtmTsa8ErbeK4pDRi:APA91bGudm8EgAHhM5LkeS4Qta6Q34MCKTt2wU13pF7rfv5cC9Q4B3J9d0uZpD6hOPqaLlotSczub85CjudtELxUngVQDorZipKqLTfyD-Zqp7w-Y-ltOVwTf9xdSulTCb35RIEU-kW4`;
const jsonFilePath = path.join(__dirname, "../firebaseKey.json");
const json = fs.readFile(jsonFilePath, "utf-8");
json.then((v) => {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(v)),
  });
});
export const sendFCM = async (req: express.Request, res: express.Response, next: any) => {
  let message: Message = {
    notification: { // 앱 켜져잇을 때, 다른 앱 사용중일때
      title: "BackGround-notifi Title",
      body: "Background-notifi Message",
    },

    token: deviceToken,
  };

  admin
    .messaging()
    .send(message)
    .then(function (response) {
      console.log("Successfully sent message: : ", response);
      return res.status(200).json({ success: true });
    })
    .catch(function (err) {
      console.log("Error Sending message!!! : ", err);
      return res.status(400).json({ success: false });
    });
};
