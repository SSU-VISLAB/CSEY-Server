import { useLocalStorage } from "adminjs";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router';

export type TabLabel = 'ongoing' | 'expired' | string

/** tab 전환 후 그 tab의 page를 불러오기 위한 커스텀 훅
 * @param {TabLabel} initialTab - 초기 Tab 설정
 * @returns {[TabLabel, (newTab: TabLabel, page: number) => void]} 현재 Tab 및 Tab 변경 핸들러
 */
export function useTabWithPagePersistence(initialTab: TabLabel): [string, (newTab: TabLabel, page: number) => void] {
  const [currentTab, setCurrentTab] = useState<TabLabel>(initialTab);
  const [ongoingTabPage, setOngoingTabPage] = useLocalStorage('ongoingTabPage', 1);
  const [expiredTabPage, setExpiredTabPage] = useLocalStorage('expiredTabPage', 1);
  const location = useLocation();
  const navigate = useNavigate();

  /** tab setter
   * @param {TabLabel} selectedTab - 현재 탭
   * @param {number} page - 현재 탭의 페이지
   * @description 현재 탭의 페이지를 localStorage에 저장
   */
  const handleTabChange = (selectedTab: TabLabel, page: number) => {
    setCurrentTab(selectedTab);
    if (selectedTab === 'ongoing') {
      setOngoingTabPage(page);
    } else {
      setExpiredTabPage(page);
    }
  };

  /** 페이지를 이동해도 항상 저장되는 것을 방지 */
  useEffect(() => {
    return () => {
      setOngoingTabPage(1);
      setExpiredTabPage(1);
    }
  }, [])

  /** tab 전환 시 전환한 tab의 page로 업데이트 */
  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const isOngoing = currentTab == 'ongoing'
    search.set("type", currentTab)
    search.set("page", isOngoing ? expiredTabPage.toString() : ongoingTabPage.toString())
    navigate({ search: search.toString() });
  }, [currentTab]);

  return [
    currentTab,
    handleTabChange,
  ];
}