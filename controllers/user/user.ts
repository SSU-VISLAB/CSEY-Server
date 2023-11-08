import { generate } from "../jwt/index.ts";
import { refreshTokens } from "./auth.ts";

type LoginSuccess = {
    accessToken: string;
    refreshToken: string;
}
type LoginFail = {
    error: string;
}

// POST /users/login
export const login = (account:string): LoginSuccess | LoginFail => {
    try {
        const { accessToken, refreshToken } = generate(account);
        refreshTokens.add(refreshToken);
        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error);
        return { error: "토큰 생성 실패" };
    }
};
