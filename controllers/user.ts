import axios from "axios";
import * as express from "express"
import { DBUser, User } from "../models/user";


export const signup = async (req:express.Request, res:express.Response, next: any) => {};

export const login = async (req:express.Request, res:express.Response, next: any) => {
  const code = req.body.code;
  console.log({code});
  try {
    const {
      access_token,
      expires_in,
      refresh_token,
      refresh_token_expires_in,
    } = await getKakaoToken(code);
    const id = await getKakaoInfo(access_token);

    let user: User = await DBUser.findUser(id);
    console.log({user});
    if (!user) {
      user = new DBUser({
        id: id,
        name: '사용자',
        activated: true,
        createdDate: new Date(),
        lastAccess: new Date(),
        major: '0'
      });
      await (user as DBUser).save();
      console.log('사용자 생성:', user.id);
    } 
    console.log('login 성공:', user.id);

    let token;
    // try {
    //   token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);
    // } catch (err) {
    //   const error = new HttpError("회원가입 실패", 500);
    //   return next(error);
    // }

    res.status(200).json({
      // 프론트로 반환
      // userId: user.id,
      token: token,
    });
  } catch (e) {
    console.error({ e });
  }
};

const getKakaoToken = async (code: any) => {
  const { KAKAO_API } = process.env;
  const url = "https://kauth.kakao.com/oauth/token";
  const params = {
    grant_type: "authorization_code",
    client_id: 'b958ef2c36fbd4932218114b53bc8328',
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

const getKakaoInfo = async (token: any) => {
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

