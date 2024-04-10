import Event from "../models/events.js";
import Notice from "../models/notice.js";
import { IEvent, INotice } from "../models/types.js";
import { redisClient } from "./connect.js";
import { getNextDay, setNoticeSchedule } from "./schedule.js";

/** 행사 글 전부 캐싱
 ** 전체 행사글 redisKey: allEvents
 ** 개별 행사글 redisKey: event:id
 */
export const initAllOngoingEvents = async () => {
  const redisKey = "allEvents";
  const eachEvents = await redisClient.keys(`event:*`);
  const eventsFromDb = (await Event.findAll({
    where: {
      expired: false, // 진행중인 행사만 가져오기
    },
  })) as IEvent[];

  // 개별 이벤트 캐싱
  // 과거 캐싱 기록 제거
  if (eachEvents.length > 0) {
    await redisClient.del(eachEvents);
  }
  for (const event of eventsFromDb) {
    const eventRedisKey = `event:${event.id}`;
    await redisClient.set(eventRedisKey, JSON.stringify(event));
  }

  // 전체 목록 캐싱
  await redisClient.set(redisKey, JSON.stringify(eventsFromDb));

  console.log("전체 행사:", await redisClient.get(redisKey));
  console.log("진행중인 행사:", eachEvents);
};

/** 공지 글 전부 캐싱
 ** 전체 공지글 redisKey - 일반 ? alerts:general : alerts:urgent
 ** 개별 공지글 redisKey - notice:id
 */
export const initAllOngoingNotices = async () => {
  const currentDate = new Date();
  const eachNotices = await redisClient.keys(`notice:*`);
  const [urgent, general] = await getAllNotices();
  // 과거 캐싱 기록 제거
  if (eachNotices.length) {
    await redisClient.del(eachNotices);
    eachNotices.splice(0, eachNotices.length);
  }

  for (const notice of urgent as INotice[]) {
    const redisKey = `notice:${notice.id}`;
    // 일반 공지로 이동해야할 긴급 공지가 있는지 체크
    const noticeNextDay = getNextDay(new Date(notice.date));
    if (noticeNextDay > currentDate.getTime()) {
      setNoticeSchedule(notice);
      eachNotices.push(redisKey);
    } else {
      notice.update({ ...notice, priority: "일반" })
    }
    // 개별 공지 캐싱
    await redisClient.set(redisKey, JSON.stringify(notice));
  }
  for (const notice of general as INotice[]) {
    const redisKey = `notice:${notice.id}`;
    await redisClient.set(redisKey, JSON.stringify(notice));
  }
  await cachingAllNotices(urgent, general);
};

export const cachingAllNotices = async (urgent?, general?) => {
  if (!urgent && !general) [urgent, general] = await getAllNotices();
  await redisClient.set(`alerts:urgent`, JSON.stringify(urgent));
  await redisClient.set(`alerts:general`, JSON.stringify(general));
}
/**
 * @returns [urgent, general]
 */
const getAllNotices = async () => {
  // 전체 긴급 공지 목록 캐싱
  const [urgent, general] = (await Notice.findAll({
    where: {
      expired: false, // 활성화된 공지만 가져오기
    }
  })).reduce((acc, val: INotice) => {
    acc[+(val.priority == '일반')].push(val);
    return acc;
  }, [[], []]);

  return [urgent, general] as [INotice[], INotice[]];
}