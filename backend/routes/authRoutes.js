const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

// 登录验证规则（同时支持邮箱和用户名）
const loginValidationRules = () => {
  return [
    body('username').optional().notEmpty().withMessage('用户名不能为空'),
    body('email').optional().isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
    body().custom((value) => {
      if (!value.username && !value.email) {
        throw new Error('请输入用户名或邮箱地址');
      }
      return true;
    }),
    body('password').notEmpty().withMessage('密码不能为空')
  ];
};

// 注册验证规则
const registerValidationRules = () => {
  return [
    body('name').notEmpty().withMessage('用户名不能为空'),
    body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
    body('password').isLength({ min: 6 }).withMessage('密码长度不能少于6位')
  ];
};

// 验证结果处理中间件
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 返回统一格式的错误响应
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg // 使用第一个错误信息
    });
  }
  next();
};

// 登录路由
router.post('/login', loginValidationRules(), validate, authController.login);

// 发送验证码路由
router.post('/send-captcha', [
  body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址')
], validate, authController.sendCaptcha);

// 注册路由
router.post('/register', registerValidationRules(), validate, authController.register);

// 获取当前用户信息路由
router.get('/current-user', authMiddleware.verifyToken, authController.getCurrentUser);

// 更新用户信息路由
router.put('/update-user', authMiddleware.verifyToken, [
  body('username').notEmpty().withMessage('用户名不能为空')
], validate, authController.updateUserInfo);

module.exports = router;
