import { Box, Pagination, Tab, Tabs, Text } from "@adminjs/design-system";
import { ActionProps, RecordsTable, useRecords, useSelectedRecords } from "adminjs";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { TabLabel, useTabWithPagePersistence } from "./hooks.js";

const YesColor = 'rgb(194, 0, 18)'; // 붉은색
const NoColor = 'rgb(48, 64, 214)'; // 푸른색

export const List: React.FC<ActionProps> = (props) => {
  const { resource, setTag } = props
  // console.log(props);
  const data = useRecords(resource.id);
  const { records, loading, direction, sortBy, page, total, fetchData, perPage } = data;
  const { selectedRecords, handleSelect, handleSelectAll, setSelectedRecords } = useSelectedRecords(records);
  const location = useLocation();
  const navigate = useNavigate();
  // custom css 부착용
  const getActionElementCss = (resourceId: string, actionName: string, suffix: string) => `${resourceId}-${actionName}-${suffix}`
  const contentTag = getActionElementCss(resource.id, "list", "table-wrapper");
  const [ currentTab, handleTabChange ] = useTabWithPagePersistence('urgent');

  useEffect(() => {
    // ended 속성의 chip 색상 적용
    const priorityMarker = window.document.querySelectorAll('section[data-css="notices-list-priority"] > span');      
    priorityMarker.forEach(element => {
      const color = element.innerText == '긴급' ? YesColor : NoColor;
      element.style.setProperty('color', color, 'important');
      element.style.setProperty('border-color', color, 'important');
      element.style.setProperty('background-color', 'white', 'important')
      });
  }, [data]);
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
      <Tab id="urgent" label="긴급 공지" />
      <Tab id="general" label="일반 공지" />
      <Tab id="expired" label="종료 공지" />
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
