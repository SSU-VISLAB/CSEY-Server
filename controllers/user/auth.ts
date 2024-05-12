import axios from "axios";
import bcrypt from "bcryptjs";
import * as express from "express";
import { User } from "../../models/index.js";
import { redisClient } from "../../redis/connect.js";
import { reissue } from "../jwt/jwt.js";
import { login } from "./index.js";

const httpOnlyCookie: express.CookieOptions = {
  httpOnly: true,
};

export const Kakao_login = async (req: express.Request, res: express.Response) => {
  console.log("kakao_login body:", req.body);
  try {
    const { kakao_accessToken, id: reqID } = req.body;
    const { id, nickname } = await getKakaoInfo(kakao_accessToken);

    if (reqID != id) throw new Error("토큰과 잘못 매치된 id");
    const cryptId = await bcrypt.hash(reqID.toString(), 10);

    const exist = await User.findOne({ where: { id } });
    let user = exist || (await User.create({
        id,
        activated: true,
        name: nickname,
        createdDate: new Date(),
        lastAccess: new Date(),
        major: null,
      }));

    // user login
    const tokens = await login(id);
    if ("error" in tokens) {
      return res.status(500).json({ message: tokens.error });
    }

    // access는 http only cookie
    // refresh는 localStorage
    res.cookie("accessToken", tokens.accessToken, httpOnlyCookie);
    res.cookie("id", id, httpOnlyCookie);
    return res.status(200).json({create: !exist, user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken})
  } catch (e) {
    console.error({ e });
  }
};
// TODO: 만료시간 다 되어가면 refresh토큰도 refresh하는 로직 작성하기
export const getRefreshToken = async (req: express.Request, res: express.Response) => {
  try {
    const refreshToken = req.body.refreshToken;
    const { code, message, accessToken } = await reissue(refreshToken);
    res.cookie("accessToken", accessToken, httpOnlyCookie);
    return res.status(code).json({ message });
  } catch (e) {
    const code = e.code || 403;
    return res.status(code).json({ message: e.message });
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  const { accessToken, refreshToken } = req.cookies;
  try {
    if (!accessToken) throw new Error("accessToken 없음");
    if (!refreshToken) throw new Error("refreshToken 없음");
    await redisClient.del(`refreshToken:${req.cookies.refreshToken}`);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({ status: 1 });
  } catch (e) {
    console.error({ e });
    // console.log("body", req.body);
    // console.log("cookies", req.cookies);
    return res.status(403).json({ message: e.message });
  }
};

const getKakaoInfo = async (kakao_accessToken: string) => {
  const getNameUrl = "https://kapi.kakao.com/v2/user/me";
  const config = {
    headers: {
      Authorization: `Bearer ${kakao_accessToken}`,
    },
  };
  try {
    const nameResponse = await axios.get(getNameUrl, config);
    const { id, properties: {nickname} } = nameResponse.data;
    console.log("data2:::", nameResponse.data)
    const res = { id, nickname };
    return res;
  } catch (e) {
    console.error("[ERROR] getKakakoInfo:", { kakao_accessToken, e });
  }
};

type KakaoTokenRefreshResponse = {
  token_type: "bearer";
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
};
