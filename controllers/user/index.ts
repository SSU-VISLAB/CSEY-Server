import { Kakao_login, getRefreshToken, logout } from "./auth.ts";
import { deleteUser } from "./delete.ts";
import { setMajor } from "./major.ts";
import { deleteAccount, getUserInfo, login } from "./user.ts";

export {
    Kakao_login, deleteAccount, deleteUser,
    getRefreshToken, getUserInfo, login,
    logout,
    setMajor
};

