import uploadFeature, { LocalProvider } from "@adminjs/upload";
import { ResourceOptions } from "adminjs";
import * as fs from "fs";
import path from "path";
import Notice from "../../models/notice.js";
import { Components, componentLoader } from "../components/index.js";
import { NoticeHandler } from "../handlers/index.js";
import { postTab } from "./common.js";

const noticeOptions: ResourceOptions = {
  navigation: postTab,

  listProperties: ["id", "priority", "title", "date", "like", "dislike"],
  showProperties: [
    "id",
    "priority",
    "expired",
    "title",
    "date",
    "like",
    "dislike",
    "content",
  ],
  editProperties: [
    "priority",
    "major_advisor",
    "title",
    "date",
    "file",
    "content",
  ],

  properties: {
    content: {
      type: "richtext",
    },
    major_advisor: {
      isRequired: true,
    },
    image: {
      isArray: true,
    },
  },

  actions: {
    list: {
      component: Components.notice_list, // list action에서 사용할 react component
      handler: NoticeHandler.list, // list action의 데이터 로드 함수 (list에 표시할 데이터 로딩)
    },
    show: {
      component: Components.notice_show, // show action에서 사용할 component
    },
    edit: {
      after: NoticeHandler.after("edit"),
      component: Components.notice_edit,
    },
    new: {
      after: NoticeHandler.after("new"),
      component: Components.notice_edit,
    },
    delete: {
      after: NoticeHandler.deleteAfter(),
    },
    bulkDelete: {
      after: NoticeHandler.bulkDelete()
    }
  },
};
const localProvider = new LocalProvider({
  bucket: "public/notices", // 저장될 경로
  opts: {
    baseUrl: "/notices",
  },
});
localProvider.upload = async function (file, key) {
  const filePath =
    process.platform === "win32" ? this.path(key) : this.path(key).slice(1); // adjusting file path according to OS

  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.rename(file.path, filePath);
  const id = key.split("/")[0];
  await Notice.update({mimeType: file.type}, {
    where: { id }
  });
};

// 부가기능(upload)
const noticeFeatures = [
  uploadFeature({
    provider: localProvider,
    validation: {
      mimeTypes: [
        "image/png",
        "image/jpeg",
        "image/bmp",
        "image/x-png",
        "image/webp",
      ],
    },
    componentLoader,
    // 저장할 파일의 각종 정보들을 테이블의 어떤 속성에 저장할 지 설정
    properties: {
      key: "image", // 저장된 경로를 image 속성에 저장
    },
    multiple: true,
  }),
];

export const NOTICE = {
  options: noticeOptions,
  features: noticeFeatures,
};
