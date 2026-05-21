const { body, validationResult } = require('express-validator');

// 验证结果处理中间件
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 运动员数据验证
exports.athleteValidationRules = () => {
  return [
    body('name').notEmpty().escape().withMessage('运动员姓名不能为空'),
    body('sport').notEmpty().escape().withMessage('运动项目不能为空'),
    body('country').optional().escape(),
    body('age').optional().isInt({ min: 10, max: 100 }).withMessage('年龄必须是10-100之间的整数'),
    body('stats').optional().isObject().withMessage('统计数据必须是对象格式'),
    body('stats.goldMedals').optional().isInt({ min: 0 }).withMessage('金牌数必须是非负整数'),
    body('stats.silverMedals').optional().isInt({ min: 0 }).withMessage('银牌数必须是非负整数'),
    body('stats.bronzeMedals').optional().isInt({ min: 0 }).withMessage('铜牌数必须是非负整数'),
    body('stats.worldRecords').optional().isInt({ min: 0 }).withMessage('世界纪录数必须是非负整数'),
    body('stats.personalBest').optional().escape(),
    body('achievements').optional().isArray().withMessage('成就列表必须是数组格式'),
    body('achievements.*').optional().escape()
  ];
};

// 新闻数据验证
exports.newsValidationRules = () => {
  return [
    // 先记录请求体
    (req, res, next) => {
      console.log('验证中间件中的请求体:', req.body);
      console.log('验证中间件中的分类值:', req.body.category);
      next();
    },
    body('title').notEmpty().isLength({ min: 5, max: 200 }).withMessage('新闻标题不能为空且长度必须在5-200个字符之间'),
    body('content').notEmpty().isLength({ min: 10 }).withMessage('新闻内容不能为空且长度不能少于10个字符'),
    body('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('日期必须是YYYY-MM-DD格式'),
    body('author').optional(),
    body('category').optional().isIn(['赛事动态', '运动员专访', '精彩瞬间', '其他', '赛事报道', '明星动态', '成绩公告']).withMessage('新闻分类无效'),
    body('imageUrl')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (!value) return true;
        if (typeof value !== 'string') throw new Error('图片URL必须是有效的URL格式');
        if (/^https?:\/\//i.test(value)) return true;
        if (value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) return true;
        throw new Error('图片URL必须是有效的URL格式');
      })
  ];
};

// 赛事数据验证
exports.eventValidationRules = () => {
  return [
    body('name').notEmpty().withMessage('赛事名称不能为空'),
    body('location').notEmpty().withMessage('举办地点不能为空'),
    body('date').notEmpty().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('日期必须是YYYY-MM-DD格式'),
    body('endDate').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('结束日期必须是YYYY-MM-DD格式'),
    body('type').optional(),
    body('status').optional().isIn(['计划中', '进行中', '已完成']).withMessage('赛事状态必须是：计划中、进行中或已完成'),
    body('description').optional(),
    body('organizer').optional(),
  ];
};