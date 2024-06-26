import { Router } from "express";
import * as eventController from "../controllers/event/index.js";
import { verifyToken } from "../controllers/jwt/index.js";

const eventRouter = Router();

/** 좋아요, 싫어요 */
eventRouter.put('/posts/events/like', verifyToken, eventController.setLike);

/** 북마크 */
eventRouter.post('/users/bookmark/add', verifyToken, eventController.setBookmark);
eventRouter.post('/users/bookmark/remove', verifyToken, eventController.deleteBookmark);

/** 행사글 요청 */
eventRouter.get('/posts/events/:eventId', eventController.getEvent)
eventRouter.get('/posts/events', eventController.getEventAll)
eventRouter.get('/posts/events/date', eventController.getEventsByDate)

export default eventRouter;