import * as express from "express";
import { IUser } from "../../models/types.js";
import { User, sequelize } from "../../models/index.js"
import { validateRequestBody, findObjectByPk } from "../common_method/index.ts";
import { generate, verifyToken, reissue } from "../jwt/index.ts";
import { getKakaoToken, getKakaoInfo } from "./index.ts";

// POST /users/login
export const login = (account:string) : { 
    accessToken?: string, 
    refreshToken?: string, 
    error?: string 
}=> {
    try {
        const { accessToken, refreshToken } = generate(account);
        return { accessToken, refreshToken };
    } catch (error) {
        console.error(error);
        return { error: "토큰 생성 실패" };
    }
};
