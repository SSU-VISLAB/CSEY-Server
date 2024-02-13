import { Op } from "sequelize";
import Event from "../models/events.ts";
import Notice from "../models/notice.ts";
import { IEvent, INotice } from "../models/types.js";
import { connectRedis, redisClient } from "./redis_server.ts";

const EXPIRE = 3600; // 유효시간 1시간

export const initializeRedis = async () => {
	await connectRedis();
	await initAllOngoingEvents();
	await initAllOngoingNotices('일반');
	await initAllOngoingNotices('긴급');
}

/** 행사 글 전부 캐싱
 ** 전체 행사글 redisKey: allEvents
 ** 개별 행사글 redisKey: event:id
 */
const initAllOngoingEvents = async () => {
  const redisKey = 'allEvents';
  const eventsFromDb = await Event.findAll({
    where: {
      expired: false // 진행중인 행사만 가져오기
    }
  }) as IEvent[];

  // 개별 이벤트 캐싱
  for (const event of eventsFromDb) {
    const eventRedisKey = `event:${event.id}`;
    await redisClient.set(eventRedisKey, JSON.stringify(event), { EX: EXPIRE });
  }

  // 전체 목록 캐싱
  await redisClient.set(redisKey, JSON.stringify(eventsFromDb), { EX: EXPIRE });

  console.log("전체 행사:", await redisClient.get(redisKey));
  console.log("진행중인 행사 개수:", await redisClient.keys(`event:*`));
}

/** 공지 글 전부 캐싱
 ** 전체 공지글 redisKey - 일반 ? alerts:general : alerts:urgent
 ** 개별 공지글 redisKey - notice:id
 */
const initAllOngoingNotices = async (priority: '일반' | '긴급') => {
  const redisKey = `alerts:${priority == '일반' ? 'general' : 'urgent'}`;
  const noticesFromDB = await Notice.findAll({
    where: {
      expired: false, // 활성화된 공지만 가져오기
      priority: {
        [Op.eq]: priority
    }
    }
  }) as INotice[];

  // 개별 공지 캐싱
  for (const notice of noticesFromDB) {
    const redisKey = `notice:${notice.id}`;
    await redisClient.set(redisKey, JSON.stringify(notice), { EX: EXPIRE });
  }
  // 전체 공지 캐싱
  await redisClient.set(redisKey, JSON.stringify(noticesFromDB), { EX: EXPIRE });

  priority == '긴급' && console.log(`진행중인 공지: `, await redisClient.keys(`notice:*`));
}