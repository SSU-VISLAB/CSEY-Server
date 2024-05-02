import uploadFeature, { LocalProvider } from "@adminjs/upload";
import { ResourceOptions } from "adminjs";
import { Components, componentLoader } from "../components/index.js";
import { EventHandler } from "../handlers/index.js";
import { postTab } from "./common.js";
import * as fs from "fs";
import path from "path";
import Event from "../../models/events.js";

const eventOptions: ResourceOptions = {
  navigation: postTab, // sidebar에서의 위치 설정
  // action별 표시할 속성 리스트 설정
  listProperties: ["id", "title", "like", "dislike", "start", "end"],
  showProperties: [
    "major_advisor",
    "like",
    "dislike",
    "expired",
    "start",
    "end",
    "title",
    "content",
    "calendar_title",
    "calendar_content",
  ],
  editProperties: [
    "start",
    "end",
    "major_advisor",
    "file",
    "title",
    "content",
    "calendar_title",
    "calendar_content",
  ],
  // 속성의 메타데이터 설정
  properties: {
    content: {
      type: "richtext", // content 속성을 richtext모드로 설정
    },
    calendar_content: {
      type: "textarea",
    },
    major_advisor: {
      isRequired: true,
    },
    image: {
      isArray: true,
    },
  },
  // action별 front단 관련 작업 설정
  actions: {
    list: {
      component: Components.event_list, // list action에서 사용할 react component
      handler: EventHandler.list, // list action의 데이터 로드 함수 (list에 표시할 데이터 로딩)
    },
    show: {
      component: Components.event_show, // show action에서 사용할 component
    },
    edit: {
      after: EventHandler.after("edit"),
      component: Components.event_edit,
    },
    new: {
      after: EventHandler.after("new"),
      component: Components.event_edit,
    },
    delete: {
      after: EventHandler.deleteAfter()
    },
    bulkDelete: {
      after: EventHandler.bulkDelete()
    }
  },
};

const localProvider = new LocalProvider({
  bucket: "public/events", // 저장될 경로
  opts: {
    baseUrl: "/events",
  },
});
localProvider.upload = async function (file, key) {
  const filePath =
    process.platform === "win32" ? this.path(key) : this.path(key).slice(1); // adjusting file path according to OS

  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.rename(file.path, filePath);
  const id = key.split("/")[0];
  await Event.update(
    { mimeType: file.type },
    {
      where: { id },
    }
  );
};
localProvider.path = function (key, bucket) {
  return process.platform === "win32"
    ? `${path.join(bucket || this.bucket, key)}`
    : `/${path.join(bucket || this.bucket, key)}`;
};
localProvider.delete = async function (key, bucket) {
  const fileLink =
    process.platform === "win32"
      ? this.path(key, bucket)
      : this.path(key, bucket).slice(1);
  if (fs.existsSync(fileLink)) {
    await fs.promises.unlink(fileLink);
  }
};
// 부가기능(upload)
const eventFeatures = [
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

export const EVENT = {
  options: eventOptions,
  features: eventFeatures,
};
