import * as express from "express"

const { default: axios } = require("axios");
const User = require("../models/user");

exports.signup = async (req:express.Request, res:express.Response, next: any) => {};

exports.login = async (req:express.Request, res:express.Response, next: any) => {
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
    console.log({access_token, id});
    // let user = await User.findUser(id);
    // if (!user) {
    //   user = new User({
    //     id: id,
    //     nickname: `사용자-${id}`.slice(0, 10),
    //     snsProvider: "kakao",
    //   });
    //   await user.save();
    // }

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
