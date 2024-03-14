import { scheduleJob } from "node-schedule";
import { INotice } from "../models/types.js";

export const setNoticeSchedule = async (row: INotice) => {
  const { id, date } = row;
  console.log('set schedule:', id, date.toLocaleString());
  const job = scheduleJob(getNextDay(date), async function () {
    console.log("run schedule:", id, date.toLocaleString(), "to 일반");
    await row.update({ ...row, priority: "일반" });
  });
  return job;
};

export const getNextDay = (date: Date) => date.setDate(date.getDate() + 1);