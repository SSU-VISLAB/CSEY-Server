import Event from "../models/events.js";
import Linktree from "../models/linktree.js";
import Notice from "../models/notice.js";
import { IEvent, INotice } from "../models/types.js";
import { redisClient } from "./connect.js";
import { getNextDay, setEventSchedule, setNoticeSchedule } from "./schedule.js";

export const initAllLinktrees = async () => {
  const redisKey = "linktrees";
  const eachLinks = await redisClient.keys(`linktrees:*`);
  const [computer, soft] = (await Linktree.findAll()).reduce(
    (acc, val: Linktree) => {
      acc[+(val.major == "소프트")].push(val);
      return acc;
    },
    [[], []]
  );
  computer.sort((a, b) => a.order - b.order);
  soft.sort((a, b) => a.order - b.order);
  if (eachLinks.length) {
    await redisClient.del(eachLinks);
  }
  await redisClient.set(`${redisKey}:컴퓨터`, JSON.stringify(computer));
  await redisClient.set(`${redisKey}:소프트`, JSON.stringify(soft));
  console.log(
    "컴터 linktree 리스트:",
    computer.map((c) => c.dataValues.text)
  );
  console.log(
    "소프트 linktree 리스트:",
    soft.map((s) => s.dataValues.text)
  );
};

/** 행사 글 전부 캐싱
 ** 전체 행사글 redisKey: allEvents
 ** 개별 행사글 redisKey: event:id
 */
export const initAllOngoingEvents = async () => {
  const redisKey = "allEvents";
  const eachEvents = await redisClient.keys(`event:*`);
  const currentDate = new Date();
  const eventsFromDb = (await Event.findAll({
    where: {
      expired: false, // 진행중인 행사만 가져오기
    },
    order: [["start", "ASC"]],
  })) as IEvent[];
  // 개별 이벤트 캐싱
  // 과거 캐싱 기록 제거
  if (eachEvents.length > 0) {
    await redisClient.del(eachEvents);
  }
  for (const event of eventsFromDb) {
    const eventRedisKey = `event:${event.id}`;
    // 종료 전이면
    if (event.end > currentDate) {
      // 종료 날에 종료되도록 스케쥴링
      setEventSchedule(event);
    } else {
      // 종료 됐으면
      // 종료로 변경
      event.update({ ...event, expired: true });
    }
    await redisClient.set(eventRedisKey, JSON.stringify(event));
  }

  // 전체 목록 캐싱
  await redisClient.set(redisKey, JSON.stringify(eventsFromDb));

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
  }

  for (const notice of urgent as INotice[]) {
    const redisKey = `notice:${notice.id}`;
    // 일반 공지로 이동해야할 긴급 공지가 있는지 체크
    const noticeNextDay = getNextDay(new Date(notice.date));
    if (noticeNextDay > currentDate.getTime()) {
      setNoticeSchedule(notice);
    } else {
      notice.update({ ...notice, priority: "일반" });
    }
    // 개별 공지 캐싱
    await redisClient.set(redisKey, JSON.stringify(notice));
  }
  console.log(
    "진행중인 긴급공지:",
    urgent.map((n) => n.id)
  );
  for (const notice of general as INotice[]) {
    const redisKey = `notice:${notice.id}`;
    await redisClient.set(redisKey, JSON.stringify(notice));
  }
  console.log(
    "진행중인 일반공지:",
    general.map((n) => n.id)
  );
  await cachingAllNotices(urgent, general);
};

/** 연/월별 행사 글 전부 캐싱
 ** <hashMap> redisKey: events:year { [month]: 게시글 리스트 }
 */
export const initAllEvents = async () => {
  const allEvents = await Event.findAll();
  Promise.all(cacheYearMonthData(allEvents));
};

export const cachingAllNotices = async (
  urgent?: INotice[],
  general?: INotice[]
) => {
  if (!urgent && !general) [urgent, general] = await getAllNotices();
  await redisClient.set(`alerts:urgent`, JSON.stringify(urgent));
  await redisClient.set(`alerts:general`, JSON.stringify(general));
};
/**
 * @returns [urgent, general]
 */
const getAllNotices = async () => {
  // 전체 긴급 공지 목록 캐싱
  const [urgent, general] = (
    await Notice.findAll({
      where: {
        expired: false, // 활성화된 공지만 가져오기
      },
    })
  ).reduce(
    (acc, val: INotice) => {
      acc[+(val.priority == "일반")].push(val);
      return acc;
    },
    [[], []]
  );
  urgent.sort((a, b) => a.date - b.date);
  general.sort((a, b) => a.date - b.date);
  return [urgent, general] as [INotice[], INotice[]];
};

/**
 * 두 날짜 사이의 연/월을 계산하는 함수
 * @param {Date} start - 시작 연/월
 * @param {Date} end - 종료 연/월
 * @returns {Array} - 연/월 목록 ['yyyy-mm']
 */
export function calculateMonthsBetween(start: Date, end: Date): string[] {
  // 시작 연도와 월, 종료 연도와 월 추출
  const startYear = start.getFullYear();
  const startMonth = start.getMonth() + 1;
  const endYear = end.getFullYear();
  const endMonth = end.getMonth() + 1;

  // 시작 날짜가 종료 날짜보다 클 경우 오류 발생
  if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
    throw new Error("시작 날짜는 종료 날짜보다 작거나 같아야 합니다.");
  }

  const result = [];
  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    result.push(`${year}-${month}`);
    month++;

    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return result;
}

export const cacheYearMonthData = (events: IEvent[]) => {
  const eventsHashMapByDate = events.reduce((yearObject, event) => {
    const { start, end } = event;
    const ranges = calculateMonthsBetween(start, end);
    ranges.forEach((range) => {
      const [year, month] = range.split('-');
      let yearKey: { [month: string]: typeof monthKey };
      let monthKey: IEvent[];
      yearKey = yearObject[year] || (yearObject[year] = {});
      monthKey = yearKey[month] || (yearKey[month] = []);
      monthKey.push(event);
    });
    return yearObject;
  }, {});

  const promises: Promise<any>[] = [];
  for (const [year, monthObject] of Object.entries(eventsHashMapByDate)) {
    const months = Object.entries(monthObject);
    for (const [month, events] of months) {
      promises.push(redisClient.hSet(`events:${year}`, month.toString(), JSON.stringify(events)));
      console.log(`events:${year}`, month.toString(), events.map(v => v.id));
    }
  }
  return promises;
};