import { AdminJSOptions, ResourceWithOptions } from "adminjs";
import { Alarm, Bookmark, BookmarkAsset, Event, EventsLike, Notice, NoticesLike, Read, ReadAsset, User } from "../models/index.ts";
import { Components, componentLoader } from "./components/index.ts";
import { COMMON } from "./resources/common.ts";
import { EVENT } from "./resources/event.ts";
import { NOTICE } from "./resources/notice.ts";

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
    { resource: User, options: COMMON.options },
    { resource: Alarm, options: COMMON.options },
    { resource: EventsLike, options: COMMON.options },
    { resource: NoticesLike, options: COMMON.options },
    // post
    { resource: Event, options: EVENT.options, features: EVENT.features},
    { resource: Notice, options: NOTICE.options },
    // others
    { resource: Read, options: COMMON.options },
    { resource: ReadAsset, options: COMMON.options },
    { resource: Bookmark, options: COMMON.options },
    { resource: BookmarkAsset, options: COMMON.options }
  ] as ResourceWithOptions[],
  componentLoader
};