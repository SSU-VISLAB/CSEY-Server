import { useLocalStorage } from "adminjs";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router';

export type TabLabel = 'urgent' | 'general' | 'expired'

/** tab 전환 후 그 tab의 page를 불러오기 위한 커스텀 훅
 * @param {TabLabel} initialTab - 초기 Tab 설정
 * @returns {[TabLabel, (newTab: TabLabel, page: number) => void]} 현재 Tab 및 Tab 변경 핸들러
 */
export function useTabWithPagePersistence(initialTab: TabLabel): [string, (newTab: TabLabel, page: number) => void] {
  const [currentTab, setCurrentTab] = useState<TabLabel>(initialTab);
  const [urgentTabPage, setUrgentTabPage] = useLocalStorage('urgentTabPage', 1);
  const [generalTabPage, setGeneralTabPage] = useLocalStorage('generalTabPage', 1);
  const [expiredTabPage, setExpiredTabPage] = useLocalStorage('expiredTabPage', 1);
  const location = useLocation();
  const navigate = useNavigate();

  /** tab setter
   * @param {TabLabel} selectedTab - 클릭한 탭
   * @param {number} prevTabPage - 이전 탭의 페이지
   * @description 이전 탭의 페이지를 localStorage에 저장
   */
  const handleTabChange = (selectedTab: TabLabel, prevTabPage: number) => {
    setCurrentTab(prevTab => {
      // 함수형 state setter 사용해서 이전 탭과 페이지도 같이 저장
      switch(prevTab) {
        case 'urgent':
          setUrgentTabPage(prevTabPage); break;
        case 'general':
          setGeneralTabPage(prevTabPage); break;
        case 'expired':
          setExpiredTabPage(prevTabPage); break;
      }
      return selectedTab;
    });
  };

  /** 페이지를 이동해도 항상 저장되는 것을 방지 */
  useEffect(() => {
    return () => {
      setUrgentTabPage(1)
      setGeneralTabPage(1)
      setExpiredTabPage(1)
    }
  }, [])

  const tabMapper = {
    urgent: urgentTabPage,
    general: generalTabPage,
    expired: expiredTabPage,
  }

  /** tab 전환 시 전환한 tab의 page로 업데이트 */
  useEffect(() => {
    const search = new URLSearchParams(location.search);
    search.set("type", currentTab);
    search.set("page", tabMapper[currentTab].toString());

    navigate({ search: search.toString() }); // 전환한 탭의 데이터 요청
  }, [currentTab]);

  return [
    currentTab,
    handleTabChange,
  ];
}