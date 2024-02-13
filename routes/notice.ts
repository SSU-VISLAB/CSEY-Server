import { Router } from "express";
import * as noticeController from "../controllers/notice/index.js"
import { verifyToken } from "../controllers/jwt/index.js";

const noticeRouter = Router();

/** 좋아요, 싫어요 */
noticeRouter.put('/posts/notices/like', verifyToken, noticeController.setLike);
noticeRouter.put('/posts/notices/dislike', verifyToken, noticeController.setDisLike);
noticeRouter.delete('/posts/notices/like', verifyToken, noticeController.deleteLike);
noticeRouter.delete('/posts/notices/dislike', verifyToken, noticeController.deleteLike);

/** 공지사항 */
noticeRouter.get('/posts/notices', noticeController.getNoticeAll);
noticeRouter.get('/posts/alerts', noticeController.getAlertAll);
noticeRouter.get('/posts/notices/:noticeId', noticeController.getNotice);
noticeRouter.get('/posts/alerts/:noticeId', noticeController.getNotice);

/** 읽음 표시 */
noticeRouter.get('/users/read', verifyToken, noticeController.getUnread);
noticeRouter.post('/users/read', verifyToken, noticeController.setRead);

export default noticeRouter;