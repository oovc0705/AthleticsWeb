const express = require('express');
const router = express.Router();
const operationLogController = require('../controllers/operationLogController');
const authMiddleware = require('../middleware/authMiddleware');

// 所有路由都需要JWT验证和管理员权限
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.isAdmin);

// 记录操作
router.post('/record', operationLogController.recordOperation);

// 获取操作记录列表（兼容前端使用的 /logs 路径）
router.get('/logs', operationLogController.getOperationLogs);
// 获取操作记录列表（标准 API 路径）
router.get('/operation-logs', operationLogController.getOperationLogs);

// 还原删除操作（兼容前端使用的 /restore/:id 路径）
router.post('/restore/:id', operationLogController.restoreOperation);
// 还原删除操作（标准 API 路径）
router.post('/operation-logs/:id/restore', operationLogController.restoreOperation);

// 删除操作记录
router.delete('/operation-logs/:id', operationLogController.deleteOperationLog);

// 获取操作统计
router.get('/stats', operationLogController.getOperationStats);

module.exports = router;