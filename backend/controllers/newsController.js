const authMiddleware = require('../middleware/authMiddleware');
const db = require('../database/db');
const axios = require('axios');

// 记录操作的辅助函数
async function recordOperation(req, operationData) {
  try {
    const adminId = req.user?.id || null;
    const adminName = req.user?.username || '管理员';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';

    await db.query(
      `INSERT INTO admin_operation_logs 
       (admin_id, admin_name, operation_type, target_type, target_id, target_title, 
        target_content, original_content, source_page, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       RETURNING *`,
      [
        adminId,
        adminName,
        operationData.operationType,
        operationData.targetType,
        operationData.targetId,
        operationData.targetTitle,
        operationData.targetContent ? JSON.stringify(operationData.targetContent) : null,
        operationData.originalContent ? JSON.stringify(operationData.originalContent) : null,
        operationData.sourcePage,
        ipAddress,
        userAgent
      ]
    );
  } catch (error) {
    console.error('记录操作失败:', error.message);
    // 不抛出错误，避免影响主要功能
  }
}

// 获取所有新闻
exports.getAllNews = async (req, res) => {
  try {
    const search = req.query.search;

    let query = `
      SELECT n.*, 
             COUNT(c.id) as comment_count,
             STRING_AGG(t.tag, ',') as tags
      FROM news n
      LEFT JOIN news_comments c ON n.id = c.news_id
      LEFT JOIN news_tags t ON n.id = t.news_id
    `;

    let queryParams = [];

    if (search && search.trim()) {
      query += ` WHERE LOWER(n.title) LIKE LOWER($1) OR LOWER(n.content) LIKE LOWER($1) OR LOWER(n.author) LIKE LOWER($1)`;
      queryParams.push(`%${search.trim()}%`);
    }

    query += ` GROUP BY n.id ORDER BY n.created_at DESC`;

    const result = await db.query(query, queryParams);
    
    const newsWithDetails = result.rows.map(news => ({
      ...news,
      tags: news.tags ? news.tags.split(',') : [],
      thumbnail: news.thumbnail || news.imageUrl || ''
    }));
    
    res.json(newsWithDetails);
  } catch (error) {
    console.error('获取新闻列表错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 根据ID获取新闻
exports.getNewsById = async (req, res) => {
  try {
    const newsId = req.params.id;
    
    // 获取新闻基本信息
    const newsResult = await db.query(
      'SELECT * FROM news WHERE id = $1', 
      [newsId]
    );
    
    if (newsResult.rows.length === 0) {
      return res.status(404).json({ error: '新闻不存在' });
    }
    
    const news = newsResult.rows[0];
    
    // 获取新闻标签
    const tagsResult = await db.query(
      'SELECT tag FROM news_tags WHERE news_id = $1',
      [newsId]
    );
    
    // 获取新闻评论
    const commentsResult = await db.query(`
      SELECT nc.*, u.username,
             (EXISTS (SELECT 1 FROM news_comment_likes WHERE comment_id = nc.id AND type = 'like' AND user_id = $2)) as user_liked,
             (EXISTS (SELECT 1 FROM news_comment_likes WHERE comment_id = nc.id AND type = 'dislike' AND user_id = $2)) as user_disliked
      FROM news_comments nc
      LEFT JOIN users u ON nc.user_id = u.id
      WHERE nc.news_id = $1 AND nc.parent_id IS NULL
      ORDER BY nc.date DESC
    `, [newsId, req.user?.id || 0]);

    // 获取所有评论的回复
    const repliesResult = await db.query(`
      SELECT nc.*, u.username,
             (EXISTS (SELECT 1 FROM news_comment_likes WHERE comment_id = nc.id AND type = 'like' AND user_id = $2)) as user_liked,
             (EXISTS (SELECT 1 FROM news_comment_likes WHERE comment_id = nc.id AND type = 'dislike' AND user_id = $2)) as user_disliked
      FROM news_comments nc
      LEFT JOIN users u ON nc.user_id = u.id
      WHERE nc.news_id = $1 AND nc.parent_id IS NOT NULL
      ORDER BY nc.date ASC
    `, [newsId, req.user?.id || 0]);

    // 将回复分组到对应的评论下
    const comments = commentsResult.rows.map(comment => {
      const replies = repliesResult.rows.filter(reply => reply.parent_id === comment.id);
      return {
        ...comment,
        replies: replies
      };
    });
    
    // 增加浏览量
    await db.query('UPDATE news SET views = COALESCE(views, 0) + 1 WHERE id = $1', [newsId]);
    
    res.json({
      ...news,
      tags: tagsResult.rows.map(row => row.tag),
      comments: comments,
      thumbnail: news.thumbnail || news.imageUrl || '' // Use imageUrl as fallback for thumbnail
    });
  } catch (error) {
    console.error('获取新闻详情错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 创建新闻
exports.createNews = async (req, res) => {
  try {
    const { title, content, author, category, thumbnail, tags } = req.body;
    
    const result = await db.query(
      `INSERT INTO news (title, content, author, category, status, thumbnail, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [title, content, author, category, 'published', thumbnail]
    );
    
    const news = result.rows[0];
    
    // 插入标签
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        await db.query(
          'INSERT INTO news_tags (news_id, tag) VALUES ($1, $2)',
          [news.id, tag]
        );
      }
    }
    
    // 记录创建操作
    try {
      await recordOperation(req, {
        operationType: 'create',
        targetType: 'news',
        targetId: news.id,
        targetTitle: news.title,
        targetContent: {
          ...news,
          tags: tags || [],
          thumbnail: news.thumbnail || news.imageUrl || ''
        },
        sourcePage: `/news/${news.id}`
      });
    } catch (logError) {
      console.error('记录创建操作失败:', logError);
      // 不影响主要功能，继续执行
    }
    
    res.status(201).json({
      ...news,
      tags: tags || [],
      thumbnail: news.thumbnail || news.imageUrl || '' // Use imageUrl as fallback for thumbnail
    });
  } catch (error) {
    console.error('创建新闻错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 更新新闻
exports.updateNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    
    // 检查新闻是否存在
    const existingResult = await db.query('SELECT * FROM news WHERE id = $1', [newsId]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: '新闻不存在' });
    }
    
    const originalNews = existingResult.rows[0];
    
    // 获取更新前的标签
    const originalTagsResult = await db.query(
      'SELECT tag FROM news_tags WHERE news_id = $1',
      [newsId]
    );
    const originalTags = originalTagsResult.rows.map(row => row.tag);
    
    const { title, content, author, category, thumbnail, tags } = req.body;
    
    // 更新新闻基本信息
    await db.query(
      `UPDATE news SET 
       title = $1, content = $2, author = $3, category = $4, thumbnail = $5, updated_at = NOW()
       WHERE id = $6`,
      [title, content, author, category, thumbnail, newsId]
    );
    
    // 更新标签 - 先删除现有标签，再插入新标签
    if (Array.isArray(tags)) {
      await db.query('DELETE FROM news_tags WHERE news_id = $1', [newsId]);
      for (const tag of tags) {
        await db.query(
          'INSERT INTO news_tags (news_id, tag) VALUES ($1, $2)',
          [newsId, tag]
        );
      }
    }
    
    // 获取更新后的新闻信息
    const updatedResult = await db.query(
      'SELECT * FROM news WHERE id = $1',
      [newsId]
    );
    
    const updatedNews = updatedResult.rows[0];
    
    // 获取更新后的标签
    const tagsResult = await db.query(
      'SELECT tag FROM news_tags WHERE news_id = $1',
      [newsId]
    );
    
    // 记录更新操作
    try {
      await recordOperation(req, {
        operationType: 'update',
        targetType: 'news',
        targetId: newsId,
        targetTitle: updatedNews.title,
        targetContent: {
          ...updatedNews,
          tags: tagsResult.rows.map(row => row.tag),
          thumbnail: updatedNews.thumbnail || updatedNews.imageUrl || ''
        },
        originalContent: {
          ...originalNews,
          tags: originalTags,
          thumbnail: originalNews.thumbnail || originalNews.imageUrl || ''
        },
        sourcePage: `/news/${newsId}`
      });
    } catch (logError) {
      console.error('记录更新操作失败:', logError);
      // 不影响主要功能，继续执行
    }
    
    res.json({
      ...updatedNews,
      tags: tagsResult.rows.map(row => row.tag),
      thumbnail: updatedNews.thumbnail || updatedNews.imageUrl || '' // Use imageUrl as fallback for thumbnail
    });
  } catch (error) {
    console.error('更新新闻错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 删除新闻
exports.deleteNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    
    // 检查新闻是否存在
    const result = await db.query('SELECT * FROM news WHERE id = $1', [newsId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '新闻不存在' });
    }
    
    const newsToDelete = result.rows[0];
    
    // 获取新闻标签
    const tagsResult = await db.query(
      'SELECT tag FROM news_tags WHERE news_id = $1',
      [newsId]
    );
    const newsTags = tagsResult.rows.map(row => row.tag);
    
    // 记录删除操作（在实际删除之前）
    try {
      await recordOperation(req, {
        operationType: 'delete',
        targetType: 'news',
        targetId: newsId,
        targetTitle: newsToDelete.title,
        targetContent: {
          ...newsToDelete,
          tags: newsTags
        },
        sourcePage: `/news/${newsId}`
      });
    } catch (logError) {
      console.error('记录删除操作失败:', logError);
      // 不影响主要功能，继续执行
    }
    
    // 删除相关的评论和标签
    await db.query('DELETE FROM news_comments WHERE news_id = $1', [newsId]);
    await db.query('DELETE FROM news_tags WHERE news_id = $1', [newsId]);
    
    // 删除新闻
    await db.query('DELETE FROM news WHERE id = $1', [newsId]);
    
    res.json({ message: '新闻删除成功' });
  } catch (error) {
    console.error('删除新闻错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 根据分类获取新闻
exports.getNewsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const result = await db.query(`
      SELECT n.*, 
             COUNT(c.id) as comment_count,
             STRING_AGG(t.tag, ',') as tags
      FROM news n
      LEFT JOIN news_comments c ON n.id = c.news_id
      LEFT JOIN news_tags t ON n.id = t.news_id
      WHERE LOWER(n.category) = LOWER($1)
      GROUP BY n.id
      ORDER BY n.created_at DESC
    `, [category]);
    
    const newsWithDetails = result.rows.map(news => ({
      ...news,
      tags: news.tags ? news.tags.split(',') : [],
      thumbnail: news.thumbnail || news.imageUrl || '' // Use imageUrl as fallback for thumbnail
    }));
    
    res.json(newsWithDetails);
  } catch (error) {
    console.error('根据分类获取新闻错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 获取最新新闻
exports.getLatestNews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const result = await db.query(`
      SELECT n.*, 
             COUNT(c.id) as comment_count,
             STRING_AGG(t.tag, ',') as tags
      FROM news n
      LEFT JOIN news_comments c ON n.id = c.news_id
      LEFT JOIN news_tags t ON n.id = t.news_id
      GROUP BY n.id
      ORDER BY n.created_at DESC
      LIMIT $1
    `, [limit]);
    
    const newsWithDetails = result.rows.map(news => ({
      ...news,
      tags: news.tags ? news.tags.split(',') : [],
      thumbnail: news.thumbnail || news.imageUrl || '' // Use imageUrl as fallback for thumbnail
    }));
    
    res.json(newsWithDetails);
  } catch (error) {
    console.error('获取最新新闻错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 搜索新闻
exports.searchNews = async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const result = await db.query(`
      SELECT n.*, 
             COUNT(c.id) as comment_count,
             STRING_AGG(t.tag, ',') as tags
      FROM news n
      LEFT JOIN news_comments c ON n.id = c.news_id
      LEFT JOIN news_tags t ON n.id = t.news_id
      WHERE LOWER(n.title) LIKE LOWER($1) OR LOWER(n.content) LIKE LOWER($1)
      GROUP BY n.id
      ORDER BY n.created_at DESC
    `, [`%${keyword}%`]);
    
    const newsWithDetails = result.rows.map(news => ({
      ...news,
      tags: news.tags ? news.tags.split(',') : [],
      thumbnail: news.thumbnail || news.imageUrl || '' // Use imageUrl as fallback for thumbnail
    }));
    
    res.json(newsWithDetails);
  } catch (error) {
    console.error('搜索新闻错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 添加新闻评论
exports.addComment = async (req, res) => {
  try {
    const newsId = req.params.id;
    const { content, parent_id, reply_to_username } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    const result = await db.query(
      `INSERT INTO news_comments (news_id, user_id, content, date, parent_id, reply_to_username, created_at)
       VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, NOW())
       RETURNING *`,
      [newsId, userId, content.trim(), parent_id || null, reply_to_username || null]
    );

    const comment = result.rows[0];
    
    // 获取用户名
    const userResult = await db.query('SELECT username FROM users WHERE id = $1', [userId]);
    
    res.status(201).json({
      ...comment,
      username: userResult.rows[0].username
    });
  } catch (error) {
    console.error('添加评论错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 点赞/取消点赞评论
exports.likeComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    // 检查是否已经点赞或点踩
    const existingLike = await db.query(
      'SELECT * FROM news_comment_likes WHERE comment_id = $1 AND user_id = $2',
      [commentId, userId]
    );

    if (existingLike.rows.length > 0) {
      const existing = existingLike.rows[0];
      
      if (existing.type === 'like') {
        // 取消点赞
        await db.query('DELETE FROM news_comment_likes WHERE id = $1', [existing.id]);
        await db.query('UPDATE news_comments SET likes = GREATEST(likes - 1, 0) WHERE id = $1', [commentId]);
        
        const commentResult = await db.query('SELECT likes, dislikes FROM news_comments WHERE id = $1', [commentId]);
        return res.json({ 
          liked: false, 
          disliked: false,
          likes: commentResult.rows[0].likes,
          dislikes: commentResult.rows[0].dislikes
        });
      } else if (existing.type === 'dislike') {
        // 从点踩改为点赞
        await db.query('UPDATE news_comment_likes SET type = $1 WHERE id = $2', ['like', existing.id]);
        await db.query('UPDATE news_comments SET likes = likes + 1, dislikes = GREATEST(dislikes - 1, 0) WHERE id = $1', [commentId]);
        
        const commentResult = await db.query('SELECT likes, dislikes FROM news_comments WHERE id = $1', [commentId]);
        return res.json({ 
          liked: true, 
          disliked: false,
          likes: commentResult.rows[0].likes,
          dislikes: commentResult.rows[0].dislikes
        });
      }
    } else {
      // 新增点赞
      await db.query(
        'INSERT INTO news_comment_likes (comment_id, user_id, type) VALUES ($1, $2, $3)',
        [commentId, userId, 'like']
      );
      await db.query('UPDATE news_comments SET likes = likes + 1 WHERE id = $1', [commentId]);
      
      const commentResult = await db.query('SELECT likes, dislikes FROM news_comments WHERE id = $1', [commentId]);
      return res.json({ 
        liked: true, 
        disliked: false,
        likes: commentResult.rows[0].likes,
        dislikes: commentResult.rows[0].dislikes
      });
    }
  } catch (error) {
    console.error('点赞评论错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 点踩/取消点踩评论
exports.dislikeComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    // 检查是否已经点赞或点踩
    const existingLike = await db.query(
      'SELECT * FROM news_comment_likes WHERE comment_id = $1 AND user_id = $2',
      [commentId, userId]
    );

    if (existingLike.rows.length > 0) {
      const existing = existingLike.rows[0];
      
      if (existing.type === 'dislike') {
        // 取消点踩
        await db.query('DELETE FROM news_comment_likes WHERE id = $1', [existing.id]);
        await db.query('UPDATE news_comments SET dislikes = GREATEST(dislikes - 1, 0) WHERE id = $1', [commentId]);
        
        const commentResult = await db.query('SELECT likes, dislikes FROM news_comments WHERE id = $1', [commentId]);
        return res.json({ 
          liked: false, 
          disliked: false,
          likes: commentResult.rows[0].likes,
          dislikes: commentResult.rows[0].dislikes
        });
      } else if (existing.type === 'like') {
        // 从点赞改为点踩
        await db.query('UPDATE news_comment_likes SET type = $1 WHERE id = $2', ['dislike', existing.id]);
        await db.query('UPDATE news_comments SET likes = GREATEST(likes - 1, 0), dislikes = dislikes + 1 WHERE id = $1', [commentId]);
        
        const commentResult = await db.query('SELECT likes, dislikes FROM news_comments WHERE id = $1', [commentId]);
        return res.json({ 
          liked: false, 
          disliked: true,
          likes: commentResult.rows[0].likes,
          dislikes: commentResult.rows[0].dislikes
        });
      }
    } else {
      // 新增点踩
      await db.query(
        'INSERT INTO news_comment_likes (comment_id, user_id, type) VALUES ($1, $2, $3)',
        [commentId, userId, 'dislike']
      );
      await db.query('UPDATE news_comments SET dislikes = dislikes + 1 WHERE id = $1', [commentId]);
      
      const commentResult = await db.query('SELECT likes, dislikes FROM news_comments WHERE id = $1', [commentId]);
      return res.json({ 
        liked: false, 
        disliked: true,
        likes: commentResult.rows[0].likes,
        dislikes: commentResult.rows[0].dislikes
      });
    }
  } catch (error) {
    console.error('点踩评论错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 删除评论
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    // 检查评论是否存在以及用户是否有权限删除
    const commentResult = await db.query(
      'SELECT * FROM news_comments WHERE id = $1',
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ error: '评论不存在' });
    }

    const comment = commentResult.rows[0];

    // 只有管理员可以删除评论
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '没有权限删除此评论' });
    }

    // 删除评论（及其所有子评论）
    await db.query('DELETE FROM news_comments WHERE id = $1 OR parent_id = $1', [commentId]);

    res.json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 获取新闻评论（支持排序）
exports.getComments = async (req, res) => {
  try {
    const newsId = req.params.id;
    const sortBy = req.query.sort || 'comprehensive'; // comprehensive, latest, hottest

    let orderBy = '';
    switch (sortBy) {
      case 'latest':
        orderBy = 'ORDER BY nc.created_at DESC';
        break;
      case 'hottest':
        orderBy = 'ORDER BY nc.likes DESC, nc.created_at DESC';
        break;
      case 'comprehensive':
      default:
        orderBy = 'ORDER BY (nc.likes - nc.dislikes) DESC, nc.created_at DESC';
        break;
    }

    // 获取主评论（没有父评论的评论）
    const commentsResult = await db.query(`
      SELECT nc.*, u.username,
             (EXISTS (SELECT 1 FROM news_comment_likes WHERE comment_id = nc.id AND type = 'like' AND user_id = $2)) as user_liked,
             (EXISTS (SELECT 1 FROM news_comment_likes WHERE comment_id = nc.id AND type = 'dislike' AND user_id = $2)) as user_disliked
      FROM news_comments nc
      LEFT JOIN users u ON nc.user_id = u.id
      WHERE nc.news_id = $1 AND nc.parent_id IS NULL
      ${orderBy}
    `, [newsId, req.user?.id || 0]);

    // 获取所有评论的回复
    const repliesResult = await db.query(`
      SELECT nc.*, u.username,
             (EXISTS (SELECT 1 FROM news_comment_likes WHERE comment_id = nc.id AND type = 'like' AND user_id = $2)) as user_liked,
             (EXISTS (SELECT 1 FROM news_comment_likes WHERE comment_id = nc.id AND type = 'dislike' AND user_id = $2)) as user_disliked
      FROM news_comments nc
      LEFT JOIN users u ON nc.user_id = u.id
      WHERE nc.news_id = $1 AND nc.parent_id IS NOT NULL
      ORDER BY nc.created_at ASC
    `, [newsId, req.user?.id || 0]);

    // 将回复分组到对应的评论下
    const comments = commentsResult.rows.map(comment => {
      const replies = repliesResult.rows.filter(reply => reply.parent_id === comment.id);
      return {
        ...comment,
        replies: replies
      };
    });

    res.json(comments);
  } catch (error) {
    console.error('获取评论错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};