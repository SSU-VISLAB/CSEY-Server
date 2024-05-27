import { Box, Pagination, Tab, Tabs, Text } from "@adminjs/design-system";
import { ActionProps, RecordsTable, useRecords, useSelectedRecords } from "adminjs";
import React, { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {useSearchParams} from "react-router-dom";
import { TabLabel, useTabWithPagePersistence } from "./hooks.js";

export const List: React.FC<ActionProps> = (props) => {
  const { resource, setTag } = props
  // console.log(props);
  const { records, loading, direction, sortBy, page, total, fetchData, perPage } = useRecords(resource.id);
  const { selectedRecords, handleSelect, handleSelectAll, setSelectedRecords } = useSelectedRecords(records);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  useLayoutEffect(() => {
    if (location.search.includes("refresh=true")) {
      searchParams.delete("refresh");
      setSearchParams(searchParams);
    }
  }, [location])

  /** 탭 변경시 선택 데이터 초기화 */
  useEffect(() => {
    setSelectedRecords([]);
  }, [resource.id, currentTab]);

  /** 데이터 가져오는 핸들러 함수 */
  const handleActionPerformed = () => fetchData();

  /** 페이지 변경 핸들러 함수 */
  const handlePaginationChange = (pageNumber: number): void => {
    searchParams.set("page", pageNumber.toString());
    setSearchParams(searchParams);
  };

  return (
    <Tabs fullWidth={true} currentTab={currentTab} onChange={(tabsID: TabLabel) => handleTabChange(tabsID, page)}>
      <Tab id="ongoing" label="진행중인 행사" />
      <Tab id="expired" label="종료된 행사" />
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
