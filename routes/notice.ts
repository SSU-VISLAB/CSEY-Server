import { Router } from "express";
import * as noticeController from "../controllers/notice/index.ts"

const noticeRouter=Router();

/** 좋아요, 싫어요 */
noticeRouter.put('/posts/notices/like',noticeController.setLike);
noticeRouter.put('/posts/notices/dislike',noticeController.setDisLike);
noticeRouter.delete('/posts/notices/like',noticeController.deleteLike);
noticeRouter.delete('/posts/notices/dislike',noticeController.deleteLike);

/** 공지사항 */
noticeRouter.get('/posts/notices',noticeController.getNoticeAll);
noticeRouter.get('/posts/alerts',noticeController.getAlertAll);
noticeRouter.get('/posts/notices/:noticeId',noticeController.getNotice);
noticeRouter.get('/posts/alerts/:noticeId',noticeController.getNotice);

/** 읽음 표시 */
noticeRouter.get('/users/read',noticeController.getUnread); // TODO: 토큰 제공 문제
noticeRouter.post('/users/read',noticeController.setRead);

export default noticeRouter;