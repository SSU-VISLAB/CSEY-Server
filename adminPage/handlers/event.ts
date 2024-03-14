import { ActionHandler, Filter, SortSetter, flat, populator } from "adminjs";
import Event from "../../models/events.js";
import { redisClient } from "../../redis/connect.js";
import { EventActionQueryParameters } from "./index.js";

const list: ActionHandler<any> = async (request, response, context) => {
  const { query } = request; // 요청 url의 query 부분 추출
  const { resource, _admin } = context; // db table
  const unflattenQuery = flat.unflatten(query || {}) as EventActionQueryParameters;
  let { page, perPage, type = 'ongoing' } = unflattenQuery;
  const isOngoing = type == 'ongoing';
  // 진행중인 행사 탭에서는 시작일 내림차순 정렬
  // 종료된 행사 탭에서는 종료일 내림차순 정렬
  const { sortBy = isOngoing ? 'start' : 'end', direction = 'desc', filters = {} } = unflattenQuery;

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
      resource.decorate().options,
    )
  };
  // 진행중인 행사 탭이면 expired == false인 데이터만
  // 종료된 행사 탭이면 expired == true인 데이터만 가져오기
  const filter = await new Filter({ ...filters, expired: isOngoing ? 'false' : 'true' }, resource).populate(context);
  const records = await resource.find(filter, {
    limit: perPage,
    offset: (page - 1) * perPage,
    sort,
  }, context);
  const populatedRecords = await populator(records, context);
  context.records = populatedRecords;
  
  // 메타데이터 및 가져온 데이터 return
  const { currentAdmin } = context;
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
}

/**
 * 게시글 create, update 후 redis에 캐싱하는 함수
 * @param action after함수를 사용할 action
 * @returns action 실행 후 호출할 hook 함수
 */
const after = (action: 'edit' | 'new') => async (originalResponse, request, context) => {
  const isPost = request.method === 'post';
  const isEdit = context.action.name === action;
  const hasRecord = originalResponse?.record?.params;
  const hasError = Object.keys(originalResponse.record.errors).length;
  // checking if object doesn't have any errors or is a edit action
  if ((isPost && isEdit) && (hasRecord && !hasError)) {
    const redisKeyEach = `event:${hasRecord.id}`;
    const redisKeyAll = 'allEvents';

    await redisClient.set(redisKeyEach, JSON.stringify(hasRecord));
    // 전체 목록 캐싱
    const allEventsFromDb = await Event.findAll({
      where: {
        expired: false // 진행중인 행사만 가져오기
      }
    });
    await redisClient.set(redisKeyAll, JSON.stringify(allEventsFromDb));
  }

  return originalResponse
}

export const EventHandler = {
  list,
  after
}