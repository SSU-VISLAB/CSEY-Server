import { AdminJSOptions, DefaultAuthProvider, DefaultAuthProviderConfig, LoginHandlerOptions, ResourceWithOptions } from "adminjs";
import { Admin, Alarm, Bookmark, BookmarkAsset, Event, EventsLike, Notice, NoticesLike, Read, ReadAsset, User } from "../models/index.js";
import { Components, componentLoader, isRunOnDist } from "./components/index.js";
import { ADMIN } from './resources/admin.js';
import { COMMON } from "./resources/common.js";
import { EVENT } from "./resources/event.js";
import { NOTICE } from "./resources/notice.js";
import { compare } from "bcrypt";
import * as url from "url";
import path from "path";

const authenticate = async (payload, context) => {
  const {email, role} = payload;
  return {email, role};
}

export const authProvider = new DefaultAuthProvider({
  componentLoader,
  authenticate
});
authProvider.handleLogin = async function({data: {email, password}}: LoginHandlerOptions, context?: any) {
  const adminModel = await Admin.findOne({ where: { account: email } });
  if (adminModel) {
    const matched = await compare(password, adminModel.password);
    if (matched) {
      return this.authenticate({email, role: adminModel.role}, context);
    }
  }
  return false;
}
export const adminOptions: AdminJSOptions = {
  dashboard: {
    component: Components.Dashboard
  },
  branding: {
    companyName: "CSEY",
    logo: "../CseyLogo.png",
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
        components: {
          Login: {
            welcomeHeader: '환영합니다',
            welcomeMessage: `관리자용 계정 정보와 비밀번호를 입력하여\n로그인 후, 행사/공지 글을 관리하세요.\n\n문의: viskkh@vis.ssu.ac.kr`
          }
        },
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
    { resource: Admin, ...ADMIN},
    { resource: Read, ...COMMON},
    { resource: ReadAsset, ...COMMON},
    { resource: Bookmark, ...COMMON},
    { resource: BookmarkAsset, ...COMMON }
  ] as ResourceWithOptions[],
  componentLoader
};