import * as express from "express";
import User from "../../models/user.ts";

// DELETE /users/${userId}
export const deleteUser = async(
    req:express.Request<any, any>,
    res: express.Response,
    next: any
)=>{
    try {
        const userId = parseInt(req.params.userId, 10);
        
        // 해당 ID의 사용자가 존재하는지 확인
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "해당 ID의 사용자를 찾을 수 없습니다." });
        }
        
        // 사용자 삭제
        await user.destroy();
        
        return res.status(200).json({ message: "사용자가 성공적으로 삭제되었습니다." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "서버 내부 에러" });
    }
}