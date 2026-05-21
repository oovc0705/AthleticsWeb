const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { newsValidationRules, validate } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// 新闻路由
router.get('/', newsController.getAllNews);
router.get('/category/:category', newsController.getNewsByCategory);
router.get('/latest', newsController.getLatestNews);
router.get('/search', newsController.searchNews);
router.get('/:id/comments', authMiddleware.optionalAuth, newsController.getComments);
router.post('/:id/comments', authMiddleware.verifyToken, newsController.addComment);
router.get('/:id', authMiddleware.optionalAuth, newsController.getNewsById);
router.put('/comments/:commentId/like', authMiddleware.verifyToken, newsController.likeComment);
router.put('/comments/:commentId/dislike', authMiddleware.verifyToken, newsController.dislikeComment);
router.delete('/comments/:commentId', authMiddleware.verifyToken, newsController.deleteComment);
router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, newsValidationRules(), validate, newsController.createNews);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, newsValidationRules(), validate, newsController.updateNews);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, newsController.deleteNews);

module.exports = router;