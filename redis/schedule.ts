import { Job, scheduleJob } from "node-schedule";
import { IEvent, INotice } from "../models/types.js";
import { cachingAllNotices } from "./caching.js";
import { redisClient } from "./connect.js";
import Event from "../models/events.js";

const jobArray: Job[] = [];
export const setNoticeSchedule = (row: INotice) => {
  const { id, date } = row;
  const key = `notice:${id}`;
  const job = scheduleJob(key, getNextDay(date), async function () {
    console.log("run schedule:", key, date.toLocaleString(), "to 일반");
    const updatedRow = await row.update({ ...row, priority: "일반" });
    await redisClient.set(key, JSON.stringify(updatedRow));
    // 전체 긴급 공지 목록 캐싱
    await cachingAllNotices();
    jobArray.splice(existJobIndex, 1);
  });
  const existJobIndex = jobArray.findIndex((j) => j?.name == key);
  if (existJobIndex > -1) {
    jobArray[existJobIndex].cancel();
    jobArray[existJobIndex] = job;
  } else {
    jobArray.push(job);
  }
  console.log("set schedule:", `${key}-${date.toLocaleString()}`);
  console.log(
    "job list:",
    jobArray.map((j) => j?.name)
  );
};
export const delNoticeSchedule = (row: INotice) => {
  const { id, date } = row;
  const key = `notice:${id}`;
  const existJobIndex = jobArray.findIndex((j) => j.name == `${key}`);
  if (existJobIndex > -1) {
    jobArray[existJobIndex].cancel();
    jobArray.splice(existJobIndex, 1);
    console.log("del schedule:", `${key}-${date.toLocaleString()}`);
    console.log(
      "job list:",
      jobArray.map((j) => j?.name)
    );
  } else {
    console.warn(`jobArray hasn't schedule-${key}`);
  }
};
export const setEventSchedule = (row: IEvent) => {
  const { id, end } = row;
  const key = `event:${id}`;
  const job = scheduleJob(key, end, async function () {
    console.log("run schedule:", key, end.toLocaleString(), "to 행사 종료");
    const updatedRow = await row.update({ ...row, expired: true });
    await redisClient.set(key, JSON.stringify(updatedRow));
    // 전체 행사 목록 캐싱
    const allEventsFromDb = await Event.findAll({
      where: {
        expired: false, // 진행중인 행사만 가져오기
      },
      order: [["start", "ASC"]],
    });
    await redisClient.set("allEvents", JSON.stringify(allEventsFromDb));
    jobArray.splice(existJobIndex, 1);
  });
  const existJobIndex = jobArray.findIndex((j) => j?.name == key);
  if (existJobIndex > -1) {
    jobArray[existJobIndex].cancel();
    jobArray[existJobIndex] = job;
  } else {
    jobArray.push(job);
  }
  console.log("set schedule:", `${key}-${end.toLocaleString()}`);
  console.log(
    "job list:",
    jobArray.map((j) => j?.name)
  );
};
export const delEventSchedule = (row: IEvent) => {
  const { id, end } = row;
  const key = `event:${id}`;
  const existJobIndex = jobArray.findIndex((j) => j.name == `${key}`);
  if (existJobIndex > -1) {
    jobArray[existJobIndex].cancel();
    jobArray.splice(existJobIndex, 1);
    console.log("del schedule:", `${key}-${end.toLocaleString()}`);
    console.log(
      "job list:",
      jobArray.map((j) => j?.name)
    );
  } else {
    console.warn(`jobArray hasn't schedule-${key}`);
  }
};
export const getNextDay = (date: Date) => date.setDate(date.getDate() + 1);
