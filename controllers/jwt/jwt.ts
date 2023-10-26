import * as jwt from "jsonwebtoken";

const ACCESS_EXPIRY = '1d';
const REFRESH_EXPIRY = '7d';

enum TokenType {
    ACCESS = "ACCESS",
    REFRESH = "REFRESH"
}

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            code: 401,
            message: '토큰이 제공되지 않았습니다.'
        });
    }

    try {
        req.decoded = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(419).json({ message: '토큰이 만료되었습니다.' });
        }
        return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
}

export const generate = (account: string) => {
    const accessToken = createToken(account, TokenType.ACCESS, ACCESS_EXPIRY);
    const refreshToken = createToken(account, TokenType.REFRESH, REFRESH_EXPIRY);

    return { accessToken, refreshToken };
}

const createToken = (account: string, tokenType: TokenType, expiresIn: string): string => {
    const payload = {
        account,
        type: tokenType,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

export const reissue = (refreshToken: string): { code: number, message: string, accessToken?: string } => {
    try {
        const decoded: any = jwt.verify(refreshToken, process.env.JWT_SECRET);

        if (decoded.type !== TokenType.REFRESH) {
            return {
                code: 500,
                message: "refresh 토큰이 유효하지 않습니다"
            };
        }

        const account = decoded.account;
        const newAccessToken = createToken(account, TokenType.ACCESS, ACCESS_EXPIRY);

        return {
            code: 200,
            message: "새로운 access token이 발급되었습니다.",
            accessToken: newAccessToken
        };
    } catch (error) {
        console.error(error);
        return {
            code: 500,
            message: "access token 재발급 실패"
        };
    }
}
