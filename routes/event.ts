import { Router } from "express";
import * as eventController from "../controllers/event/index.ts"

const eventRouter=Router();

/** 좋아요, 싫어요 */
eventRouter.put('/posts/events/like',eventController.setLike);
eventRouter.put('/posts/events/dislike',eventController.setDisLike);
eventRouter.delete('/posts/events/like',eventController.deleteLike);
eventRouter.delete('/posts/events/dislike',eventController.deleteLike);

/** 북마크 */
eventRouter.post('/users/bookmark',eventController.setBookmark);
eventRouter.delete('/users/bookmark',eventController.deleteBookmark);

/** 행사글 요청 */
eventRouter.get('/posts/events/:eventId',eventController.getEvent)
eventRouter.get('/posts/events',eventController.getEventAll)

export default eventRouter;