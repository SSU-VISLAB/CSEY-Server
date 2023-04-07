const express = require('express');

const postsController = require('../controllers/posts');

const router = express.Router();

/** url: /posts/alerts */
router.get('/alerts', postsController.alerts);

/** url: /posts/events */
router.get('/events', postsController.events);

/** url: /posts/schedule */
router.get('/schedule', postsController.schedule);

/** url: /posts/events/like */
router.put('/events/like', postsController.events.like);

/** url: /posts/events/dislike */
router.put('/events/dislike', postsController.events.dislike);

/** url: /posts/notices/like */
router.put('/notices/like', postsController.notices.like);

/** url: /posts/notices/dislike */
router.put('/notices/dislike', postsController.notices.dislike);

/** url: /posts/events/행사글id */
router.get('/events/:행사글id', postsController.events.행사글id);

/** url: /posts/notices/:공지글id */
router.get('/notices/:공지글id', postsController.notices.공지글id);

/** url: /posts/alerts/:공지글id */
router.get('/alerts/:공지글id', postsController.alerts.공지글id);

/** url: /posts/notices */
router.get('/notices', postsController.notices);

module.exports = router;