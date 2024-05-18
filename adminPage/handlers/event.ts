import { ActionHandler, Filter, SortSetter, flat, populator } from "adminjs";
import Event from "../../models/events.js";
import { redisClient } from "../../redis/connect.js";
import { EventActionQueryParameters } from "./index.js";
import { IEvent } from "../../models/types.js";
import { delEventSchedule, setEventSchedule } from "../../redis/schedule.js";
import {
  cacheYearMonthData,
  calculateMonthsBetween,
} from "../../redis/caching.js";

const list: ActionHandler<any> = async (request, response, context) => {
  const { query } = request; // 요청 url의 query 부분 추출
  const { resource, _admin, currentAdmin } = context; // db table
  const { role } = currentAdmin;
  const unflattenQuery = flat.unflatten(
    query || {}
  ) as EventActionQueryParameters;
  let { page, perPage, type = "ongoing" } = unflattenQuery;
  const isOngoing = type == "ongoing";
  // 진행중인 행사 탭에서는 시작일 내림차순 정렬
  // 종료된 행사 탭에서는 종료일 내림차순 정렬
  const {
    sortBy = isOngoing ? "start" : "end",
    direction = "desc",
    filters = { major_advisor: role },
  } = unflattenQuery;

  // adminOptions.settings.defaultPerPage, 한 페이지에 몇 행 보여줄 지
  if (perPage) {
    perPage = +perPage > 500 ? 500 : +perPage;
  } else {
    perPage = _admin.options.settings?.defaultPerPage ?? 10;
  }
  page = +page || 1;

  // resource(DB table)에서 어떤 데이터를 가져올 지 filter 생성
  const listProperties = resource.decorate().getListProperties();
  const firstProperty = listProperties.find((p) => p.isSortable());
  let sort;
  if (firstProperty) {
    sort = SortSetter(
      { sortBy, direction },
      firstProperty.name(),
      resource.decorate().options
    );
  }
  // 진행중인 행사 탭이면 expired == false인 데이터만
  // 종료된 행사 탭이면 expired == true인 데이터만 가져오기
  const filter = await new Filter(
    { ...filters, expired: isOngoing ? "false" : "true" },
    resource
  ).populate(context);
  const records = await resource.find(
    filter,
    {
      limit: perPage,
      offset: (page - 1) * perPage,
      sort,
    },
    context
  );
  const populatedRecords = await populator(records, context);
  context.records = populatedRecords;
  // 메타데이터 및 가져온 데이터 return
  const total = await resource.count(filter, context);
  return {
    meta: {
      total,
      perPage,
      page,
      direction: sort?.direction,
      sortBy: sort?.sortBy,
    },
    records: populatedRecords.map((r) => r.toJSON(currentAdmin)),
  };
};

/**
 * 게시글 create, update 후 redis에 캐싱하는 함수
 * @param action after함수를 사용할 action
 * @returns action 실행 후 호출할 hook 함수
 */
const after = (action: "edit" | "new") => async (originalResponse, request, context) => {
    const isPost = request.method === "post";
    const isEdit = context.action.name === action;
    const {
      currentAdmin: { role },
    } = context;
    const hasRecord: IEvent = originalResponse?.record?.params;
    const hasError = Object.keys(originalResponse.record.errors).length;
    // checking if object doesn't have any errors or is a edit action
    if (isPost && isEdit && hasRecord && !hasError) {
      const { id, start, end } = hasRecord;
      const promises = [];
      // 학과는 로그인한 관리자의 것으로 적용
      if (role != "관리자") {
        hasRecord.major_advisor = role;
      }
      // redis 캐싱
      const redisKeyEach = `event:${id}`;
      const redisKeyAll = "allEvents";
      promises.push(redisClient.set(redisKeyEach, JSON.stringify(hasRecord)));
      // end날이 아직 안 지났다면
      if (end > new Date()) {
        // end날 이후 종료 상태로 변경하는 스케쥴 등록
        const recordModel = await Event.findOne({
          where: { id },
        });
        setEventSchedule(recordModel);
      }
      // 캐싱
      const allEvents = await Event.findAll({
        order: [["start", "ASC"]],
      });
      // 수정한 글의 시작~종료일 사이 연-월 리스트 추출
      const ranges = calculateMonthsBetween(start, end);

      // 진행 중인 행사글, 수정한 글의 시작~종료일 사이에 있는 모든 행사글(=관련글) 추출
      const [onGoings, relations] = allEvents.reduce(
        (acc, event) => {
          if (!event.expired) acc[0].push(event);
          if (
            ranges.some((range) => {
              const [year, month] = range.split("-");
              const startOfMonth = new Date(+year, +month - 1, 1);
              const endOfMonth = new Date(+year, +month, 0, 23, 59, 59);
              return (
                (event.start >= startOfMonth && event.start <= endOfMonth) ||
                (event.end >= startOfMonth && event.end <= endOfMonth) ||
                (event.start <= startOfMonth && event.end >= endOfMonth)
              );
            })
          )
            acc[1].push(event);
          return acc;
        },
        [[], []] as IEvent[][]
      );
      // 전체 목록 캐싱
      promises.push(redisClient.set(redisKeyAll, JSON.stringify(onGoings)));
      console.log({ relations: relations.map((v) => v.id) });
      // 관련글들을 연:월로 grouping
      promises.push(...cacheYearMonthData(relations));
      await Promise.all(promises);
    }

    return originalResponse;
  };

const deleteAfter = () => async (originalResponse, request, context) => {
  const isPost = request?.method === "post";
  const isAction = context?.action.name === "delete";
  const { record } = originalResponse;
  console.log({isPost, action: context?.action.name, record});
  // checking if object doesn't have any errors or is a edit action
  if (isPost && isAction && record) {
    const { id, start, end } = record;
    const redisKeyAll = "allEvents";
    const promises = [];
    promises.push(redisClient.del(`event:${id}`));

    if (end > new Date()) {
      delEventSchedule(record);
    }
    // 캐싱
    const allEvents = await Event.findAll({
      order: [["start", "ASC"]],
    });
    // 수정한 글의 시작~종료일 사이 연-월 리스트 추출
    const ranges = calculateMonthsBetween(start, end);

    // 진행 중인 행사글, 수정한 글의 시작~종료일 사이에 있는 모든 행사글(=관련글) 추출
    const [onGoings, relations] = allEvents.reduce(
      (acc, event) => {
        if (!event.expired) acc[0].push(event);
        if (
          ranges.some((range) => {
            const [year, month] = range.split("-");
            const startOfMonth = new Date(+year, +month - 1, 1);
            const endOfMonth = new Date(+year, +month, 0, 23, 59, 59);
            return (
              (event.start >= startOfMonth && event.start <= endOfMonth) ||
              (event.end >= startOfMonth && event.end <= endOfMonth) ||
              (event.start <= startOfMonth && event.end >= endOfMonth)
            );
          })
        )
          acc[1].push(event);
        return acc;
      },
      [[], []] as IEvent[][]
    );
    // 전체 목록 캐싱
    promises.push(redisClient.set(redisKeyAll, JSON.stringify(onGoings)));
    // 관련글들을 연:월로 grouping
    promises.push(...cacheYearMonthData(relations));
    await Promise.all(promises);
  }

  return originalResponse;
};

const bulkDelete = () => async (originalResponse, request, context) => {
  const isPost = request?.method === "post";
  const isAction = context?.action.name === "bulkDelete";
  const { records } = originalResponse;

  // checking if object doesn't have any errors or is a edit action
  if (isPost && isAction && records) {
    const promises = records.map(async ({ params: record }) => {
      // redis 캐싱 제거
      if (record.end > new Date()) {
        // 스케쥴에 등록된 행사들 제거
        delEventSchedule(record);
      }
      return redisClient.del(`event:${record.id}`);
    });
    const redisKeyAll = "allEvents";
    // 전체 목록 캐싱
    const allEvents = await Event.findAll({
      order: [["start", "ASC"]],
    });

    promises.push(redisClient.set(redisKeyAll, JSON.stringify(allEvents.filter(e => !e.expired))));
    promises.push(...cacheYearMonthData(allEvents));
    await Promise.all(promises);
  }
  return originalResponse;
};

export const EventHandler = {
  list,
  after,
  deleteAfter,
  bulkDelete,
};
