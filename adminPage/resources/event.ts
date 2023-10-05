import uploadFeature from '@adminjs/upload';
import { ResourceOptions } from 'adminjs';
import { Components, componentLoader } from "../components/index.ts";
import { Handlers } from "../handlers/index.ts";
import { postTab } from './common.ts';

const eventOptions: ResourceOptions = {
  navigation: postTab,
  listProperties: ['id', 'title', 'like', 'dislike', 'start', 'end'],
  showProperties: ['major_advisor', 'like', 'dislike', 'ended', 'start', 'end', 'title', 'content'],
  editProperties: ['start', 'end', 'major_advisor', 'title', 'file', 'content'],
  properties: {
    content: {
      type: 'richtext'
    },
  },
  actions: {
    list: {
      component: Components.event_list,
      handler: Handlers.EventHandler.list,
    },
    show: {
      component: Components.event_show
    },
    edit: {},
    new: {}
  }
};

const eventFeatures = [uploadFeature({
  provider: {
    local: {
      bucket: 'public',
      opts: {
        baseUrl: ''
      }
    }
  },
  validation: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/bmp', 'image/x-png', 'image/webp'],
  },
  componentLoader,
  // 저장할 파일의 각종 정보들을 테이블의 어떤 속성에 저장할 지
  properties: {
    key: "image",
  }
})];

export const EVENT = {
  options: eventOptions,
  features: eventFeatures
};