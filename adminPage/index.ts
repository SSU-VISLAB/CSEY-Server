import { AdminJSOptions, ResourceWithOptions } from "adminjs";
import { Alarm, Bookmark, BookmarkAsset, Event, EventsLike, Notice, NoticesLike, Read, ReadAsset, User } from "../models/index.js";
import { Components, componentLoader } from "./components/index.js";
import { COMMON } from "./resources/common.js";
import { EVENT } from "./resources/event.js";
import { NOTICE } from "./resources/notice.js";

export const adminOptions: AdminJSOptions = {
  dashboard: {
    component: Components.Dashboard
  },
  branding: {
    companyName: "CSEY",
    logo: "./CseyLogo.png",
    favicon: "./CseyLogo.png",
    withMadeWithLove: false
  },
  version: {
    app: "1.0.0",
    admin: true
  },
  // 번역(기본 - en)
  locale: {
    language: 'en',
    translations: {
      en: {
        actions: {
          list: '목록',
          search: '검색',
          new: '새 글 등록',
          show: '상세 보기',
          edit: '수정',
          delete: '삭제'
        },
        labels: {
          events: '행사',
          notices: '공지',
          navigation: '',
        },
      }
    }
  },
  // list에서 페이지 별 표시될 행 수
  settings: {
    defaultPerPage: 5,
  },
  // 따로 추가할 정적 파일들 (css, js)
  assets: {
    styles: ["/common.css"]
  },
  // 관리할 models 목록
  resources: [
    // user
    { resource: User, ...COMMON},
    { resource: Alarm, ...COMMON},
    { resource: EventsLike, ...COMMON},
    { resource: NoticesLike, ...COMMON},
    // post
    { resource: Event, ...EVENT},
    { resource: Notice, ...NOTICE},
    // others
    { resource: Read, ...COMMON},
    { resource: ReadAsset, ...COMMON},
    { resource: Bookmark, ...COMMON},
    { resource: BookmarkAsset, ...COMMON }
  ] as ResourceWithOptions[],
  componentLoader
};