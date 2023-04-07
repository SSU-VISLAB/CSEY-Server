/* 카카오 로그인 말고 user의 정보에 관한 파일*/
const express = require('express');

const usersController = require('../controllers/users');

const router = express.Router();

/** url: /users/:id/major */
router.put('/:id/major', usersController.id.major);

/** url: /users/:id/major */
router.delete('/:id/major', usersController.id.major);

/** url: /users/bookmark */
router.put('/bookmark', usersController.bookmark);

/** url: /users/read */
router.post('/read', usersController.read);

/** url: /users/:id */
router.get('/:id', usersController.id);

/** url: /users/:id */
router.delete('/:id', usersController.id);

/** url: /users/:id/alarms/push */
router.put('/:id/alarms/push', usersController.id.alarms.push);

/** url: /users/:id/alarms/events/set */
router.put('/:id/alarms/events/set', usersController.id.alarms.events.set);

/** url: /users/:id/alarms/events/timer */
router.put('/:id/alarms/events/timer', usersController.id.alarms.events.timer);

/** url: /users/:id/alarms/events/post */
router.put('/:id/alarms/events/post', usersController.id.alarms.events.post);

/** url: /users/:id/alarms/major-schedule/day */
router.put('/:id/alarms/major-schedule/day', usersController.id.alarms.majorschedule.day);

/** url: /users/:id/alarms/major-schedule/post */
router.put('/:id/alarms/major-schedule/post', usersController.id.alarms.majorschedule.post);

/** url: /users/:id/alarms/notices/push */
router.put('/:id/alarms/notices/push', usersController.id.alarms.notices.push);

/** url: /users/:id/alarms/alerts/push */
router.put('/:id/alarms/alerts/push', usersController.id.alarms.alerts.push);

module.exports = router;
