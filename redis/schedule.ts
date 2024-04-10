import { Job, scheduleJob } from "node-schedule";
import { INotice } from "../models/types.js";
import { cachingAllNotices } from "./caching.js";
import { redisClient } from "./connect.js";

const jobArray: Job[] = [];
export const setNoticeSchedule = (row: INotice) => {
  const { id, date } = row;
  const job = scheduleJob(`${id}`, getNextDay(date), async function () {
    console.log("run schedule:", id, date.toLocaleString(), "to 일반");
    const updatedRow = await row.update({ ...row, priority: "일반" });
    await redisClient.set(`notice:${id}`, JSON.stringify(updatedRow));
    // 전체 긴급 공지 목록 캐싱
    await cachingAllNotices();
    jobArray.splice(existJobIndex, 1);
  });
  const existJobIndex = jobArray.findIndex(j => j.name == `${id}`);
  if (existJobIndex > -1) {
    jobArray[existJobIndex].cancel();
    jobArray[existJobIndex] = job;
  } else {
    jobArray.push(job);
  }
  console.log('set schedule:', `${id}-${date.toLocaleString()}`);
  console.log('job list:', jobArray.map(j => j?.name));
};
export const delNoticeSchedule = (row: INotice) => {
  const {id, date} = row;
  const existJobIndex = jobArray.findIndex(j => j.name == `${id}`);
  if (existJobIndex > -1) {
    jobArray[existJobIndex].cancel();
    jobArray.splice(existJobIndex, 1);
    console.log('del schedule:', `${id}-${date.toLocaleString()}`);
    console.log('job list:', jobArray.map(j => j?.name));
  } else {
    console.warn(`jobArray hasn't schedule-${id}`);
  }
}

export const getNextDay = (date: Date) => date.setDate(date.getDate() + 1);