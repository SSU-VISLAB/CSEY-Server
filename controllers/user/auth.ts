import axios from 'axios';
import bcrypt from 'bcryptjs';
import * as express from "express";
import { User } from "../../models/index.ts";
import { reissue } from "../jwt/jwt.ts";
import { login } from './index.ts';

const SALT_ROUNDS = 10; // bcrypt 해싱 복잡도
export const refreshTokens = new Set<string>();

export const Kakao_login = async (req: express.Request, res: express.Response, next: any) => {
  try {
    const { kakao_accessToken, kakao_refreshToken, id: originalId, expired } = req.body;
    const { id, access_token: new_kakao_access_token, refresh_token: new_kakao_refresh_token, expires_in: new_expires_in } =
      await getKakaoInfo(kakao_accessToken, kakao_refreshToken, expired);

    if (originalId != id) throw new Error('토큰과 잘못 매치된 id');
    const cryptId = await bcrypt.hash(originalId.toString(), 10);

    const existingUser = await User.findOne({ where: { id } });

    if (!existingUser) { // User가 없으면 회원가입
      const currentDate = new Date();
      const newUser = await User.create({
        id,
        activated: true,
        name: null,
        createdDate: currentDate,
        lastAccess: currentDate,
        major: null,
      });
      return res.status(201).json({ message: '회원 가입 성공', user: newUser });
    }

    // user login
    const tokens = login(id);
    if ('error' in tokens) {
      return res.status(500).json({ message: tokens.error });
    }
    const cookieOptions: express.CookieOptions = {
      sameSite: 'none',
      httpOnly: true,
      secure: true,
    };
    // TODO: access와 refresh를 cookie와 localStorage중 어느 곳에 저장할 지 정하기
    res.cookie('accessToken', tokens.accessToken, cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
    res.cookie('name', existingUser.name, {
      sameSite: 'none',
      secure: true,
    });
    res.cookie('id', id, cookieOptions);
    return res.status(200).json({ ...tokens, name: existingUser.name, new_kakao_access_token, new_kakao_refresh_token, new_expires_in });
  } catch (e) {
    console.error({ e });
  }
};

export const getRefreshToken = async (req: express.Request, res: express.Response) => {
  try {
    const { code, message, accessToken } = reissue(req.body.refreshToken);
    return res.status(code).json({ message, accessToken });
  } catch ({ code, message }) {
    return res.status(code).json({ message });
  }
}

export const logout = async (req: express.Request, res: express.Response) => {
  const {kakao_accessToken} = req.body;
  const {refreshToken} = req.cookies;
  try {
    if (!kakao_accessToken) throw new Error('kakao_accessToken 없음');
    if (!refreshToken) throw new Error('refreshToken 없음');
    kakaoLogout(req.body.kakao_accessToken);
    refreshTokens.delete(req.cookies.refreshToken);
    return res.status(200).json({ status: 1 });
  } catch (e) {
    console.error({e})
    // console.log("body", req.body);
    // console.log("cookies", req.cookies);
    return res.status(403).json({message: e.message});
  }
}

const kakaoLogout = async (kakao_accessToken: string) => {
  try {
    const id = await axios.post('https://kapi.kakao.com/v1/user/logout', {}, {
      headers: {
        Authorization: `Bearer ${kakao_accessToken}`
      }
    }).then(res => res.data);
    return id;
  } catch (e) {
    throw e
  }
}

const getKakaoInfo = async (kakao_accessToken: string, kakao_refreshToken: string, expired: number) => {
  const url = "https://kapi.kakao.com/v1/user/access_token_info";
  const config = {
    headers: {
      Authorization: `Bearer ${kakao_accessToken}`,
    },
  };
  try {
    const refreshedResponse = new Date().getTime() > new Date(expired).getTime() && await refreshKakaoToken(kakao_refreshToken);
    if (refreshedResponse) {
      config.headers.Authorization = `Bearer ${refreshedResponse.access_token}`
    }
    const response = await axios.get(url, config);
    const { id } = response.data;
    const res = { id, ...refreshedResponse };
    return res;
  } catch (e) {
    console.error("ERROR", e);
  }
};

const refreshKakaoToken = async (kakao_refreshToken: string) => {
  const response = await axios.post('https://kauth.kakao.com/oauth/token', ({
    grant_type: 'refresh_token',
    client_id: process.env.REST_API_KEY, // .env 사용
    refresh_token: kakao_refreshToken,
  }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } }).then(res => res.data);
  return response as KakaoTokenRefreshResponse;
}

type KakaoTokenRefreshResponse = {
  token_type: 'bearer',
  access_token: string,
  id_token: string,
  expires_in: number,
  refresh_token: string,
  refresh_token_expires_in: number
}