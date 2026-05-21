const db = require('../database/db');

// 添加收藏
const addToFavorites = async (userId, type, itemId) => {
  // 验证收藏类型
  if (!['athlete', 'event', 'news'].includes(type)) {
    throw new Error('无效的收藏类型');
  }

  // 检查是否已经收藏
  const existingResult = await db.query(
    'SELECT id FROM favorites WHERE user_id = $1 AND item_type = $2 AND item_id = $3',
    [userId, type, itemId]
  );

  if (existingResult.rows.length === 0) {
    await db.query(
      'INSERT INTO favorites (user_id, item_type, item_id, created_at) VALUES ($1, $2, $3, NOW())',
      [userId, type, itemId]
    );
  }

  return { success: true };
};

// 移除收藏
const removeFromFavorites = async (userId, type, itemId) => {
  // 验证收藏类型
  if (!['athlete', 'event', 'news'].includes(type)) {
    throw new Error('无效的收藏类型');
  }

  await db.query(
    'DELETE FROM favorites WHERE user_id = $1 AND item_type = $2 AND item_id = $3',
    [userId, type, itemId]
  );

  return { success: true };
};

// 获取用户收藏
const getUserFavorites = async (userId) => {
  const result = await db.query(
    'SELECT item_type, item_id FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  // 按类型分组收藏项目
  const favorites = {
    athletes: [],
    events: [],
    news: []
  };

  result.rows.forEach(row => {
    const typeKey = `${row.item_type}s`;
    if (favorites[typeKey]) {
      favorites[typeKey].push(row.item_id);
    }
  });

  return favorites;
};

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites
};
