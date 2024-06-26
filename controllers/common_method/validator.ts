import { Event, Notice, User } from "../../models/index.js";

const modelMap = new Map([
    ['user_id', User],
    ['notice_id', Notice],
    ['event_id', Event as any]
]);

export interface IGenericUserRequest {
    user_id?: string;
    notice_id?: string;
    event_id?: string;
}

// Request body 검증 함수
export const validateRequestBody = (body: any, bodyList: any): boolean => {
    const keys = Object.keys(body);
    return !keys.some((key) => !bodyList.includes(key));
};

// User 있는지 확인
export async function findUser(user_id: number) {
    const user = await User.findByPk(user_id);

    if (!user) {
        throw new Error("사용자를 찾을 수 없습니다.");
    }
}

// 기본키로 해당 객체 있는지 확인
export async function findObjectByPk(body: IGenericUserRequest) {
    const errors = [];

    for (const key of Object.keys(body)) {
        if (modelMap.has(key)) {
            const Model = modelMap.get(key);
            const object = await Model.findByPk(body[key]);
            if (!object) {
                errors.push(`${body[key]}:${key}에 해당하는 객체를 찾을 수 없습니다.`);
            }
        }
    }

    return errors.length > 0 ? errors.join(" ") : null;
}