import { ResourceOptions } from 'adminjs';
import { Components } from "../components/index.ts";
import { Handlers } from "../handlers/index.ts";
import { postTab } from './common.ts';

const noticeOptions: ResourceOptions = {
  navigation: postTab,

  listProperties: ['id','priority','title','date','like','dislike'],
  showProperties: ['id','priority','title','date','like','dislike','content'],
  editProperties: ['priority', 'major_advisor', 'title', 'date', 'content'],

  properties: {
    content: {
      type: 'richtext'
    }
  },

  actions: {
    list: {
      component: Components.notice_list, // list action에서 사용할 react component
      handler: Handlers.NoticeHandler.list, // list action의 데이터 로드 함수 (list에 표시할 데이터 로딩)
    },
    show: {
      component: Components.notice_show // show action에서 사용할 component
    },
    edit: {}, // 기본값 사용
    new: {}
  }
}

export const NOTICE = {
  options: noticeOptions
}