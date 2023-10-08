import uploadFeature from '@adminjs/upload';
import { ResourceOptions } from 'adminjs';
import { Components, componentLoader } from "../components/index.ts";
import { Handlers } from "../handlers/index.ts";
import { postTab } from './common.ts';

const eventOptions: ResourceOptions = {
  navigation: postTab, // sidebar에서의 위치 설정
  // action별 표시할 속성 리스트 설정
  listProperties: ['id', 'title', 'like', 'dislike', 'start', 'end'],
  showProperties: ['major_advisor', 'like', 'dislike', 'expired', 'start', 'end', 'title', 'content'],
  editProperties: ['start', 'end', 'major_advisor', 'title', 'file', 'content'],
  // 속성의 메타데이터 설정
  properties: {
    content: {
      type: 'richtext' // content 속성을 richtext모드로 설정
    },
  },
  // action별 front단 관련 작업 설정
  actions: {
    list: {
      component: Components.event_list, // list action에서 사용할 react component
      handler: Handlers.EventHandler.list, // list action의 데이터 로드 함수 (list에 표시할 데이터 로딩)
    },
    show: {
      component: Components.event_show // show action에서 사용할 component
    },
    edit: {}, // 기본값 사용
    new: {}
  }
};

// 부가기능(upload)
const eventFeatures = [uploadFeature({
  provider: {
    local: {
      bucket: 'public', // 저장될 경로
      opts: {
        baseUrl: ''
      }
    }
  },
  validation: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/bmp', 'image/x-png', 'image/webp'],
  },
  componentLoader,
  // 저장할 파일의 각종 정보들을 테이블의 어떤 속성에 저장할 지 설정
  properties: {
    key: "image", // 저장된 경로를 image 속성에 저장
  }
})];

export const EVENT = {
  options: eventOptions,
  features: eventFeatures
};