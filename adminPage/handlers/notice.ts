import { ActionHandler, Filter, SortSetter, flat, populator } from "adminjs";
import { Op } from "sequelize";
import Notice from "../../models/notice.js";
import { redisClient } from "../../redis/connect.js";
import { NoticeActionQueryParameters } from "./index.js";
import { setNoticeSchedule } from "../../redis/schedule.js";
import { INotice } from "../../models/types.js";

const list: ActionHandler<any> = async (request, response, context) => {
  const { query } = request; // 요청 url의 query 부분 추출
  // console.log(query);
  
  const { resource, _admin } = context; // db table
  const unflattenQuery = flat.unflatten(query || {}) as NoticeActionQueryParameters;
  let { page, perPage, type = 'urgent' } = unflattenQuery;
  // 진행중인 행사 탭에서는 시작일 내림차순 정렬
  // 종료된 행사 탭에서는 종료일 내림차순 정렬
  const { sortBy = 'date', direction = 'desc', filters = {} } = unflattenQuery;

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

  const noticeTypeMapper = {
    'urgent': {priority: '긴급', expired: 'false'},
    'general': {priority: '일반', expired: 'false'},
    'expired': {expired: 'true'}
  }
  
  const filter = await new Filter({ ...filters, ...noticeTypeMapper[type] }, resource).populate(context);
  const records = await resource.find(filter, {
    limit: perPage,
    offset: (page - 1) * perPage,
    sort,
  }, context);
  // console.log(records);
  
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
    const {priority, id} = hasRecord;
    const isGeneral = priority == '일반'
    const redisKeyEach = `notice:${id}`;
    const redisKeyAll = `alerts:${isGeneral ? 'general' : 'urgent'}`;

    // 이 글 캐싱
    await redisClient.set(redisKeyEach, JSON.stringify(hasRecord));
    // 긴급일 경우 스케쥴러 등록
    if (!isGeneral) {
      const recordModel = await Notice.findOne({
        where: { id }
      }) as INotice;
      await setNoticeSchedule(recordModel);
    }
    // 전체 목록 캐싱
    const noticesFromDB = await Notice.findAll({
      where: {
        expired: false, // 활성화된 공지만 가져오기
        priority: {
          [Op.eq]: priority
      }
      }
    });
    await redisClient.set(redisKeyAll, JSON.stringify(noticesFromDB));
  }

  return originalResponse
}

export const NoticeHandler = {
  list,
  after
}