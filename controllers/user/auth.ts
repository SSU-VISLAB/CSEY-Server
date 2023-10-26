import axios from "axios";
import * as express from "express";
import * as bcrypt from 'bcrypt';
import { User } from "../../models/index.ts"
import { generate } from "../jwt/jwt.ts";
import { login } from "./user.ts";

const SALT_ROUNDS = 10; // bcrypt 해싱 복잡도

export const Kakao_login = async (req: express.Request, res: express.Response, next: any) => {
  const code = req.body.code;
  console.log({ code });
  try {
    const {
      access_token,
      expires_in,
      refresh_token,
      refresh_token_expires_in,
    } = await getKakaoToken(code);
    const originalId = await getKakaoInfo(access_token);

    const cryptId = await bcrypt.hash(originalId.toString(), 10);

    const existingUser = await User.findOne({ where: { account: cryptId } });

    if (!existingUser) { // User가 없으면 회원가입
      const currentDate = new Date();
      const newUser = await User.create({
        account: cryptId,
        activated: true,
        name: null,
        createdDate: currentDate,
        lastAccess: currentDate,
        major: null,
      });
      return res.status(201).json({ message: '회원 가입 성공', user: newUser });
    }

    // user login
    const tokens = login(originalId);
    if (tokens.error) {
      return res.status(500).json({ message: tokens.error });
    }
    return res.status(200).json(tokens);

  } catch (e) {
    console.error({ e });
  }
};

export const getKakaoToken = async (code: any) => {
  const { KAKAO_API } = process.env;
  const url = "https://kauth.kakao.com/oauth/token";
  const params = {
    grant_type: "authorization_code",
    client_id: process.env.KAKAO_CLIENT_ID,
    redirect_uri: "http://localhost:3000/login", 
    code,
  };
  try {
    const response = await axios.post(url, null, {
      params,
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });
    return response.data;
  } catch (e) {
    console.error(e);
  }
};

export const getKakaoInfo = async (token: any) => {
  const url = "https://kapi.kakao.com/v1/user/access_token_info";
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.get(url, config);
    const { id } = response.data;

    return id;
  } catch (e) {
    console.error(e);
  }
};

