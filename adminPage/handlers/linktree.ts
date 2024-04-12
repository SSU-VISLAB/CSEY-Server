import { ActionHandler, Filter, SortSetter, flat, populator } from "adminjs";

const list: ActionHandler<any> = async (request, response, context) => {
  const { query } = request; // 요청 url의 query 부분 추출
  // console.log(query);

  const { resource, _admin, currentAdmin } = context; // db table
  const { role } = currentAdmin;
  const unflattenQuery = flat.unflatten(
    query || {}
  );
  let { page, perPage } = unflattenQuery;
  // 진행중인 행사 탭에서는 시작일 내림차순 정렬
  // 종료된 행사 탭에서는 종료일 내림차순 정렬
  const {
    sortBy = "order",
    direction = "asc",
    filters = { major: role },
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
  const filter = await new Filter(
    { ...filters },
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

export const LinktreeHandler = {
    list,
  }