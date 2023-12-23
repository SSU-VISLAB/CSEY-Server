import axios from 'axios';
import bcrypt from 'bcryptjs';
import * as express from "express";
import { User } from "../../models/index.ts";
import { redisClient } from '../../redis/redis_server.ts';
import { reissue } from "../jwt/jwt.ts";
import { login } from './index.ts';

export const Kakao_login = async (req: express.Request, res: express.Response) => {
  console.log('kakao_login body:',req.body)
  try {
    const { kakao_accessToken, id: originalId } = req.body;
    const { id } = await getKakaoInfo(kakao_accessToken);

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
    const tokens = await login(id);
    if ('error' in tokens) {
      return res.status(500).json({ message: tokens.error });
    }
    const httpOnlyCookie: express.CookieOptions = {
      sameSite: 'none',
      httpOnly: true,
      secure: true,
    };
    // access는 localStorage
    // refresh는 http only cookie
    res.cookie('refreshToken', tokens.refreshToken, httpOnlyCookie);
    return res.status(200).json({ accessToken: tokens.accessToken, id, name: existingUser.name });
  } catch (e) {
    console.error({ e });
  }
};
// TODO: 만료시간 다 되어가면 refresh토큰도 refresh하는 로직 작성하기
export const getRefreshToken = async (req: express.Request, res: express.Response) => {
  try {
    const { code, message, accessToken } = await reissue(req.cookies.refreshToken);
    return res.status(code).json({ message, accessToken });
  } catch ({ code, message }) {
    return res.status(code).json({ message });
  }
}

export const logout = async (req: express.Request, res: express.Response) => {
  const {accessToken} = req.body;
  const {refreshToken} = req.cookies;
  try {
    if (!accessToken) throw new Error('accessToken 없음');
    if (!refreshToken) throw new Error('refreshToken 없음');
    await redisClient.del(`refreshToken:${req.cookies.refreshToken}`);
    res.clearCookie('refreshToken');
    return res.status(200).json({ status: 1 });
  } catch (e) {
    console.error({e})
    // console.log("body", req.body);
    // console.log("cookies", req.cookies);
    return res.status(403).json({message: e.message});
  }
}

const getKakaoInfo = async (kakao_accessToken: string) => {
  const url = "https://kapi.kakao.com/v1/user/access_token_info";
  const config = {
    headers: {
      Authorization: `Bearer ${kakao_accessToken}`,
    },
  };
  try {
    const response = await axios.get(url, config);
    const { id } = response.data;
    const res = { id };
    return res;
  } catch (e) {
    console.error("[ERROR] getKakakoInfo:", {kakao_accessToken, e});
  }
};

type KakaoTokenRefreshResponse = {
  token_type: 'bearer',
  access_token: string,
  id_token: string,
  expires_in: number,
  refresh_token: string,
  refresh_token_expires_in: number
}