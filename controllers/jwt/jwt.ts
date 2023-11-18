import * as Express from 'express';
import jwt from "jsonwebtoken";
import { refreshTokens } from "../user/auth.ts";

const ACCESS_EXPIRY = '1d';
const REFRESH_EXPIRY = '7d';

type Payload = {
    id: string;
    type: TokenType;
}

enum TokenType {
    ACCESS = "ACCESS",
    REFRESH = "REFRESH"
}

export const verifyToken = (req: Express.Request, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({
            code: 401,
            message: '토큰이 제공되지 않았습니다.'
        });
    }

    try {
        const payload = jwt.verify(token, process.env.SECRET_KEY) as Payload;
        if (payload.id != req.params.id) {
            throw new Error('토큰과 다른 사용자.')
        }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(419).json({ message: '토큰이 만료되었습니다.' });
        }
        // TODO: error.message 수정하기
        return res.status(401).json({ message: '유효하지 않은 토큰입니다.' + ' ' + error.message });
    }
}

export const generate = (id: string) => {
    const accessToken = createToken(id, TokenType.ACCESS, ACCESS_EXPIRY);
    const refreshToken = createToken(id, TokenType.REFRESH, REFRESH_EXPIRY);

    return { accessToken, refreshToken };
}

const createToken = (id: string, tokenType: TokenType, expiresIn: string): string => {
    const payload: Payload = {
        id: id.toString(),
        type: tokenType,
    };

    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn });
}

export const reissue = (refreshToken: string): { code: number, message: string, accessToken?: string } => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY) as Payload;

        if (decoded.type !== TokenType.REFRESH) {
            throw {
                code: 500,
                message: "refresh 토큰이 유효하지 않습니다"
            };
        }

        if (!refreshTokens.has(refreshToken)) {
            throw {
                code: 500,
                message: "로그인 되지 않은 사용자 입니다."
            }
        }

        const id = decoded.id;
        const newAccessToken = createToken(id, TokenType.ACCESS, ACCESS_EXPIRY);

        return {
            code: 200,
            message: "새로운 access token이 발급되었습니다.",
            accessToken: newAccessToken
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}
