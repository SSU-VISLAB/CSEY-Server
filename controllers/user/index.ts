import { Kakao_login, getRefreshToken, logout } from "./auth.js";
import { deleteUser } from "./delete.js";
import { setMajor } from "./major.js";
import { deleteAccount, getUserInfo, login } from "./user.js";

export {
    Kakao_login, deleteAccount, deleteUser,
    getRefreshToken, getUserInfo, login,
    logout,
    setMajor
};

