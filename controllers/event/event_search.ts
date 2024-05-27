import * as express from "express";
import { Event, sequelize } from "../../models/index.js";
import { IEvent } from "../../models/types.js";
import { redisClient } from "../../redis/connect.js";
import { redisGetAndParse } from "../common_method/utils.js";
import { Op } from "sequelize";

const EXPIRE = 3600; // 유효시간 1시간

// GET /posts/events/${행사글id}
export const getEvent = async (
  req: express.Request<any, any>,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const eventId = req.params.eventId;
    if (eventId == "date") return next();
    const redisKey = `event:${eventId}`;
    let event: IEvent;

    // Redis 먼저 조회
    const eventRedis = await redisClient.get(redisKey);

    if (eventRedis) {
      event = JSON.parse(eventRedis);
    } else {
      // Redis에 없는 경우, DB에서 조회
      event = (await Event.findByPk(eventId)) as IEvent;

      if (event) {
        await redisClient.set(redisKey, JSON.stringify(event), { EX: EXPIRE });
      } else {
        return res
          .status(400)
          .json({ message: "해당 행사를 찾을 수 없습니다." });
      }
    }
    return res.status(200).json(event);
  } catch (error) {
    // console.log(error);
    return res.status(500).json({ message: "서버 내부 에러", error });
  }
};

// GET /events
export const getEventAll = async (
  req: express.Request<any, any>,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const eventAll = await redisGetAndParse("allEvents");
    return res.status(200).json(eventAll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 내부 에러" });
  }
};

// GET /events/date
export const getEventsByDate = async (
  req: express.Request<any, any>,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { year, month } = req.query;
    console.log({year, month});
    if (
      !year ||
      !month ||
      !Number.isInteger(+year) ||
      !Number.isInteger(+month) ||
      (+year <= 2020 || +year >= 2040) ||
      (+month < 1 || +month > 12)
    ) {
      throw new Error(`query string error: year:${year} month:${month}`);
    }
    // redis 캐싱 확인
    const cachedEvents = await redisClient.hGet(`events:${year}`, month.toString());
    return res.status(200).json(JSON.parse(cachedEvents));
    // // DB 쿼리
    // const startOfMonth = new Date(+year, +month - 1, 1);
    // const endOfMonth = new Date(+year, +month, 0, 23, 59, 59);

    // const events = await Event.findAll({
    //   where: {
    //     [Op.or]: [
    //       {
    //         start: {
    //           [Op.between]: [startOfMonth, endOfMonth],
    //         },
    //       },
    //       {
    //         end: {
    //           [Op.between]: [startOfMonth, endOfMonth],
    //         },
    //       },
    //       {
    //         [Op.and]: [
    //           {
    //             start: {
    //               [Op.lte]: startOfMonth,
    //             },
    //           },
    //           {
    //             end: {
    //               [Op.gte]: endOfMonth,
    //             },
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // });
    // // redis 캐싱
    // // TODO: 서버 시작 시 캐싱하므로 상관 없는 코드지만,
    // // 사용해야 할 경우 연관된 연/월 key들 전부 캐싱 (시작 캐싱 함수처럼)
    // await redisClient.hSet(`events:${year}`, month.toString(), JSON.stringify(events));
    // return res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "서버 내부 에러", message: error.message });
  }
};
