import { ResourceOptions } from "adminjs";
import { hash } from 'bcrypt';

const adminOptions: ResourceOptions = {
  // navigation: false, // sidebar에서의 위치 설정
  editProperties: ['account', 'pw', 'role'],
  // 속성의 메타데이터 설정
  properties: {
    password: {
      isVisible: false
    },
    pw: {
      type: 'string',
      isVisible: {
        list: false, edit: true, filter: false, show: false
      }
    }
  },
  // action별 front단 관련 작업 설정
  actions: {
    new: {
      before: async (request) => {
        if(request.payload.pw) {
          request.payload = {
            ...request.payload,
            password: await hash(request.payload.pw, 10),
            pw: undefined,
          }
        }
        return request
      },
    },
    edit: {
      before: async (request) => {
        console.log(request.payload.pw)
        if(request.payload.pw) {
          request.payload = {
            ...request.payload,
            password: await hash(request.payload.pw, 10),
            pw: undefined,
          }
          console.log(request.payload.password)
        }
        return request
      },
    }
  }
};

export const ADMIN = {
  options: adminOptions,
};