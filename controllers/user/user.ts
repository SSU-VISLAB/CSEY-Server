import express from 'express';
import User from '../../models/user.ts';
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
export const login = (account: string): LoginSuccess | LoginFail => {
    try {
        const { accessToken, refreshToken } = generate(account);
        refreshTokens.add(refreshToken);
        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error);
        return { error: "토큰 생성 실패" };
    }
};

export const getUserData = async (req: express.Request, res: express.Response) => {
    console.log("params", req.params);
    try {
        const userId = req.params.id;
        const userData = await User.findOne({ where: { id: userId } });
        return res.status(200).json(userData);
    } catch (e) {
        console.error({ e });
    }
}