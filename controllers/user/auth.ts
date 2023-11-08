import bcrypt from 'bcryptjs';
import * as express from "express";
import { User } from "../../models/index.ts";
import { reissue } from "../jwt/jwt.ts";
import { login } from "./user.ts";

const SALT_ROUNDS = 10; // bcrypt 해싱 복잡도
export const refreshTokens = new Set<string>();

export const Kakao_login = async (req: express.Request, res: express.Response, next: any) => {
  try {
    const {kakao_accessToken, kakao_refreshToken, id: originalId} = req.body;

    const cryptId = await bcrypt.hash(originalId.toString(), 10);

    const existingUser = await User.findOne({ where: { id: originalId } });

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
    if ('error' in tokens) {
      return res.status(500).json({ message: tokens.error });
    }
    
    // TODO: access와 refresh를 cookie와 localStorage중 어느 곳에 저장할 지 정하기
    res.cookie('accessToken', tokens.accessToken, {
      sameSite: 'none',
      httpOnly: true,
      secure: true,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      sameSite: 'none',
      httpOnly: true,
      secure: true,
    });
    return res.status(200).json(tokens);
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
  refreshTokens.delete(req.body.refreshToken);
  res.status(204);
}
