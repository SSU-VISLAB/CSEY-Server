import { Job, scheduleJob } from "node-schedule";
import Notice from "../models/notice.js";
import { INotice } from "../models/types.js";
import { redisClient } from "./connect.js";

const jobArray: Job[] = [];
export const setNoticeSchedule = (row: INotice) => {
  const { id, date } = row;
  const job = scheduleJob(`${id}`, getNextDay(date), async function () {
    console.log("run schedule:", id, date.toLocaleString(), "to 일반");
    const updatedRow = await row.update({ ...row, priority: "일반" });
    await redisClient.set(`notice:${id}`, JSON.stringify(updatedRow));
    // 전체 긴급 공지 목록 캐싱
    const [urgent, general] = (await Notice.findAll({
      where: {
        expired: false, // 활성화된 공지만 가져오기
      }
    })).reduce((acc, val: INotice) => {
      acc[+(val.priority == '일반')].push(val);
      return acc;
    }, [[], []]);
    await redisClient.set(`alerts:urgent`, JSON.stringify(urgent));
    await redisClient.set(`alerts:general`, JSON.stringify(general));
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

export const getNextDay = (date: Date) => date.setDate(date.getDate() + 1);