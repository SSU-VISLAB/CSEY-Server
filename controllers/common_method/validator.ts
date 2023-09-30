import User from "../../models/user.ts";

// Request body 검증 함수
export const validateRequestBody = (body: any, bodyList:any): boolean => {
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