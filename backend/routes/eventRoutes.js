const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { eventValidationRules, validate } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', eventController.getAllEvents);
router.get('/status/:status', eventController.getEventsByStatus);
router.get('/location/:location', eventController.getEventsByLocation);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/date-range', eventController.getEventsByDateRange);

// 将静态路由 `/schedules` 放在动态路由 `/:id/schedules` 之前，避免路由匹配错误
router.get('/schedules/:scheduleId', eventController.getScheduleById);
router.get('/schedules/:scheduleId/results', eventController.getEventResults);
router.post('/schedules', authMiddleware.verifyToken, authMiddleware.isAdmin, eventController.createSchedule);
router.put('/schedules/:scheduleId', authMiddleware.verifyToken, authMiddleware.isAdmin, eventController.updateSchedule);
router.delete('/schedules/:scheduleId', authMiddleware.verifyToken, authMiddleware.isAdmin, eventController.deleteSchedule);

// 动态路由放在静态路由之后
router.get('/:id/schedules', eventController.getEventSchedules);
router.get('/:id', eventController.getEventById);
router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, eventValidationRules(), validate, eventController.createEvent);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, eventValidationRules(), validate, eventController.updateEvent);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, eventController.deleteEvent);

// 结果相关路由
router.post('/results', authMiddleware.verifyToken, authMiddleware.isAdmin, eventController.createResult);
router.put('/results/:resultId', authMiddleware.verifyToken, authMiddleware.isAdmin, eventController.updateResult);
router.delete('/results/:resultId', authMiddleware.verifyToken, authMiddleware.isAdmin, eventController.deleteResult);

module.exports = router;