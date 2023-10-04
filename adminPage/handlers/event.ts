import { ActionQueryParameters, Filter, SortSetter, flat, populator } from "adminjs";

const list = async (request, response, context) => {
  const { query } = request
  const { resource, _admin } = context
  let { page, perPage, type = 'ongoing' } = flat.unflatten(query || {});
  const isOngoing = type == 'ongoing';
  const { sortBy = isOngoing ? 'start' : 'end', direction = 'desc', filters = {} } = flat.unflatten(query || {}) as ActionQueryParameters

  if (perPage) {
    perPage = +perPage > 500 ? 500 : +perPage
  } else {
    perPage = _admin.options.settings?.defaultPerPage ?? 10
  }
  page = Number(page) || 1

  const listProperties = resource.decorate().getListProperties()
  const firstProperty = listProperties.find((p) => p.isSortable())
  let sort
  if (firstProperty) {
    sort = SortSetter(
      { sortBy, direction },
      firstProperty.name(),
      resource.decorate().options,
    )
  }
  const filter = await new Filter({ ...filters, ended: isOngoing ? 'false' : 'true' }, resource).populate(context)

  const { currentAdmin } = context
  const records = await resource.find(filter, {
    limit: perPage,
    offset: (page - 1) * perPage,
    sort,
  }, context)
  const populatedRecords = await populator(records, context)

  // eslint-disable-next-line no-param-reassign
  context.records = populatedRecords

  const total = await resource.count(filter, context)
  return {
    meta: {
      total,
      perPage,
      page,
      direction: sort?.direction,
      sortBy: sort?.sortBy,
    },
    records: populatedRecords.map((r) => r.toJSON(currentAdmin)),
  }
}

export const EventHandler = {
  list
}