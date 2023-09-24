import { Box, Pagination, Text } from "@adminjs/design-system";
import { ActionProps, RecordsTable, useRecords, useSelectedRecords } from "adminjs";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export const List: React.FC<ActionProps> = (props) => {
  const { resource, setTag } = props
  const { records, loading, direction, sortBy, page, total, fetchData, perPage } = useRecords(resource.id);
  const { selectedRecords, handleSelect, handleSelectAll, setSelectedRecords } = useSelectedRecords(records);
  const location = useLocation();
  const navigate = useNavigate();
  console.log(useRecords(resource.id));
  useEffect(() => {
    if (setTag) {
      setTag(total.toString());
    }
  }, [total]);

  useEffect(() => {
    setSelectedRecords([]);
  }, [resource.id]);

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    if (search.get("refresh")) {
      setSelectedRecords([]);
    }
  }, [location.search]);

  const handleActionPerformed = (): any => fetchData();

  const handlePaginationChange = (pageNumber: number): void => {
    const search = new URLSearchParams(location.search);
    search.set("page", pageNumber.toString());
    navigate({ search: search.toString() });
  };
  const getActionElementCss = (resourceId: string, actionName: string, suffix: string) => `${resourceId}-${actionName}-${suffix}`
  const contentTag = getActionElementCss(resource.id, "list", "table-wrapper");

  return (
    <Box variant="container" data-css={contentTag}>
      <RecordsTable
        resource={resource}
        records={records}
        actionPerformed={handleActionPerformed}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        selectedRecords={selectedRecords}
        direction={direction}
        sortBy={sortBy}
        isLoading={loading}
      />
      <Text mt="xl" textAlign="center">
        <Pagination page={page} perPage={perPage} total={total} onChange={handlePaginationChange} />
      </Text>
    </Box>
  );
};

export default List
