import { Router } from "express";
import * as eventController from "../controllers/event/index.js"
import { verifyToken } from "../controllers/jwt/index.js";

const eventRouter = Router();

/** 좋아요, 싫어요 */
eventRouter.put('/posts/events/like', verifyToken, eventController.setLike);
eventRouter.put('/posts/events/dislike', verifyToken, eventController.setDisLike);
eventRouter.delete('/posts/events/like', verifyToken, eventController.deleteLike);
eventRouter.delete('/posts/events/dislike', verifyToken, eventController.deleteLike);

/** 북마크 */
eventRouter.post('/users/bookmark', verifyToken, eventController.setBookmark);
eventRouter.delete('/users/bookmark', verifyToken, eventController.deleteBookmark);

/** 행사글 요청 */
eventRouter.get('/posts/events/:eventId', eventController.getEvent)
eventRouter.get('/posts/events', eventController.getEventAll)

export default eventRouter;