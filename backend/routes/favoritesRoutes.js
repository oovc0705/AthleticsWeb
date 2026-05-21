const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites
} = require('../services/favoritesService');

// 添加收藏
router.post('/:type/:id', authMiddleware.verifyToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;
    
    if (!['athlete', 'event', 'news'].includes(type)) {
      return res.status(400).json({ error: '无效的收藏类型' });
    }

    const result = await addToFavorites(userId, type, id);
    res.json(result);
  } catch (error) {
    console.error('添加收藏失败:', error);
    res.status(500).json({ error: error.message || '添加收藏失败' });
  }
});

// 移除收藏
router.delete('/:type/:id', authMiddleware.verifyToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user.id;
    
    if (!['athlete', 'event', 'news'].includes(type)) {
      return res.status(400).json({ error: '无效的收藏类型' });
    }

    const result = await removeFromFavorites(userId, type, id);
    res.json(result);
  } catch (error) {
    console.error('移除收藏失败:', error);
    res.status(500).json({ error: error.message || '移除收藏失败' });
  }
});

// 获取用户所有收藏
router.get('/', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await getUserFavorites(userId);
    // 确保返回标准格式的数据
    res.json({
      athletes: favorites.athletes || [],
      events: favorites.events || [],
      news: favorites.news || []
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    // 返回空数据而不是错误，防止前端崩溃
    res.json({
      athletes: [],
      events: [],
      news: []
    });
  }
});

module.exports = router;
