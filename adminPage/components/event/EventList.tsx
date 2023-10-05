import { Box, Pagination, Tab, Tabs, Text } from "@adminjs/design-system";
import { ActionProps, RecordsTable, useRecords, useSelectedRecords } from "adminjs";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { TabLabel, useTabWithPagePersistence } from "./hooks.ts";

export const List: React.FC<ActionProps> = (props) => {
  const { resource, setTag } = props
  const { records, loading, direction, sortBy, page, total, fetchData, perPage } = useRecords(resource.id);
  const { selectedRecords, handleSelect, handleSelectAll, setSelectedRecords } = useSelectedRecords(records);
  const location = useLocation();
  const navigate = useNavigate();
  // custom css 부착용
  const getActionElementCss = (resourceId: string, actionName: string, suffix: string) => `${resourceId}-${actionName}-${suffix}`
  const contentTag = getActionElementCss(resource.id, "list", "table-wrapper");
  const [ currentTab, handleTabChange ] = useTabWithPagePersistence('ongoing');

  /** list 제목 옆에 chip형태로 나오는 행 수 업데이트 */
  useEffect(() => {
    if (setTag) {
      setTag(total.toString());
    }
  }, [total]);

  /** 탭 변경시 선택 데이터 초기화 */
  useEffect(() => {
    setSelectedRecords([]);
  }, [resource.id, currentTab]);

  /** 데이터 가져오는 핸들러 함수 */
  const handleActionPerformed = () => fetchData();

  /** 페이지 변경 핸들러 함수 */
  const handlePaginationChange = (pageNumber: number): void => {
    const search = new URLSearchParams(location.search);
    search.set("page", pageNumber.toString());
    navigate({ search: search.toString() });
  };

  return (
    <Tabs fullWidth={true} currentTab={currentTab} onChange={(tabsID: TabLabel) => handleTabChange(tabsID, page)}>
      <Tab id="ongoing" label="진행중인 행사" />
      <Tab id="ended" label="종료된 행사" />
      {/* 원래는 Tab의 children으로 넣어줘야 하는데, 둘이 동일한 내용이라 이렇게 작성함 */}
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
    </Tabs>
  );
};

export default List