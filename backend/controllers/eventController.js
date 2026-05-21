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

// 获取所有赛事
exports.getAllEvents = async (req, res) => {
  try {
    const search = req.query.search;

    let query = `
      SELECT e.*,
             (SELECT COUNT(*) FROM event_comments c WHERE c.event_id = e.id) as comment_count
      FROM events e
    `;

    let queryParams = [];

    if (search && search.trim()) {
      query += ` WHERE LOWER(e.name) LIKE LOWER($1) OR LOWER(e.location) LIKE LOWER($1) OR LOWER(e.description) LIKE LOWER($1)`;
      queryParams.push(`%${search.trim()}%`);
    }

    query += ` ORDER BY e.date ASC`;

    const result = await db.query(query, queryParams);
    
    res.json(result.rows);
  } catch (error) {
    console.error('获取赛事列表错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 根据ID获取赛事
exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const result = await db.query(`
      SELECT e.*
      FROM events e
      WHERE e.id = $1
    `, [eventId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '赛事未找到' });
    }
    
    const event = result.rows[0];
    
    // 获取评论数
    const commentCountResult = await db.query(
      'SELECT COUNT(*) as count FROM event_comments WHERE event_id = $1',
      [eventId]
    );
    event.comment_count = commentCountResult.rows[0].count;
    
    // 获取赛事的评论
    const commentsResult = await db.query(`
      SELECT ec.*, u.username, u.avatar
      FROM event_comments ec
      LEFT JOIN users u ON ec.user_id = u.id
      WHERE ec.event_id = $1
      ORDER BY ec.created_at DESC
    `, [eventId]);
    
    event.comments = commentsResult.rows;
    
    // 获取赛事的时间表
    const schedulesResult = await db.query(`
      SELECT es.*
      FROM event_schedules es
      WHERE es.event_id = $1
      ORDER BY es.event_date ASC, es.event_time ASC
    `, [eventId]);
    
    event.schedules = schedulesResult.rows;
    
    res.json(event);
  } catch (error) {
    console.error('获取赛事详情错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 添加评论
exports.addComment = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { content, userId, username } = req.body;

    // 验证赛事是否存在
    const eventResult = await db.query('SELECT id FROM events WHERE id = $1', [eventId]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: '赛事未找到' });
    }

    const result = await db.query(
      `INSERT INTO event_comments (event_id, user_id, content, created_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING *`,
      [eventId, userId, content]
    );

    // 获取完整的评论信息，包括用户名和头像
    const commentResult = await db.query(`
      SELECT ec.*, u.username, u.avatar
      FROM event_comments ec
      LEFT JOIN users u ON ec.user_id = u.id
      WHERE ec.id = $1
    `, [result.rows[0].id]);

    res.status(201).json(commentResult.rows[0]);
  } catch (error) {
    console.error('添加评论错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 创建赛事
exports.createEvent = async (req, res) => {
  try {
    const { name, date, location, description, imageUrl, level, type, status, organizer, endDate, schedules } = req.body;
    
    // 使用事务确保赛事主体和时间表项目的创建是原子操作
    await db.query('BEGIN');
    
    const eventResult = await db.query(
      `INSERT INTO events (name, date, location, description, image_url, level, type, status, organizer, end_date, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
       RETURNING *`,
      [name, date, location, description, imageUrl, level, type, status, organizer, endDate]
    );
    
    const event = eventResult.rows[0];
    
    // 处理赛事时间表
    if (schedules && Array.isArray(schedules)) {
      for (const schedule of schedules) {
        await db.query(
          `INSERT INTO event_schedules (event_id, event_name, event_date, event_time, venue, status, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [event.id, schedule.event_name, schedule.event_date, schedule.event_time, schedule.venue, schedule.status || '未开始', schedule.description]
        );
      }
    }
    
    await db.query('COMMIT');
    
    // 记录创建操作
    try {
      await recordOperation(req, {
        operationType: 'create',
        targetType: 'event',
        targetId: event.id,
        targetTitle: event.name,
        targetContent: event,
        sourcePage: `/events/${event.id}`
      });
    } catch (logError) {
      console.error('记录创建操作失败:', logError);
      // 不影响主要功能，继续执行
    }
    
    res.status(201).json(event);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('创建赛事错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 更新赛事
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, date, location, description, imageUrl, status, level, type, organizer, endDate, schedules = [] } = req.body;
    
    console.log('Backend updateEvent - 接收到的数据:', { eventId, name, date, location, description, imageUrl, status, level, type, organizer, endDate, schedules });
    
    // 获取更新前的数据
    const originalResult = await db.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (originalResult.rows.length === 0) {
      return res.status(404).json({ error: '赛事未找到' });
    }
    const originalEvent = originalResult.rows[0];
    
    // 使用事务确保赛事主体和时间表项目的更新是原子操作
    await db.query('BEGIN');
    
    const eventResult = await db.query(
      `UPDATE events 
       SET name = $1, date = $2, location = $3, description = $4, image_url = $5, status = $6, level = $7, type = $8, organizer = $9, end_date = $10, updated_at = NOW()
       WHERE id = $11 
       RETURNING *`,
      [name, date, location, description, imageUrl, status, level, type, organizer, endDate, eventId]
    );
    
    console.log('Backend updateEvent - 更新结果:', eventResult.rows[0]);
    
    // 删除原有的时间表项目
    await db.query('DELETE FROM event_schedules WHERE event_id = $1', [eventId]);
    
    // 插入新的时间表项目
    if (schedules && Array.isArray(schedules)) {
      for (const schedule of schedules) {
        await db.query(
          `INSERT INTO event_schedules (event_id, event_name, event_date, event_time, venue, status, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [eventId, schedule.event_name, schedule.event_date, schedule.event_time, schedule.venue, schedule.status || '未开始', schedule.description]
        );
      }
    }
    
    await db.query('COMMIT');
    
    // 记录更新操作
    try {
      await recordOperation(req, {
        operationType: 'update',
        targetType: 'event',
        targetId: eventId,
        targetTitle: eventResult.rows[0].name,
        targetContent: eventResult.rows[0],
        originalContent: originalEvent,
        sourcePage: `/events/${eventId}`
      });
    } catch (logError) {
      console.error('记录更新操作失败:', logError);
      // 不影响主要功能，继续执行
    }
    
    res.json(eventResult.rows[0]);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('更新赛事错误:', error);
    console.error('错误详情:', error.stack);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 删除赛事
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // 获取要删除的赛事信息（用于记录操作）
    const eventResult = await db.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: '赛事未找到' });
    }
    const eventToDelete = eventResult.rows[0];
    
    // 记录删除操作（在实际删除之前）
    try {
      await recordOperation(req, {
        operationType: 'delete',
        targetType: 'event',
        targetId: eventId,
        targetTitle: eventToDelete.name,
        targetContent: eventToDelete,
        sourcePage: `/events/${eventId}`
      });
    } catch (logError) {
      console.error('记录删除操作失败:', logError);
      // 不影响主要功能，继续执行
    }
    
    // 删除赛事的评论
    await db.query('DELETE FROM event_comments WHERE event_id = $1', [eventId]);
    
    // 删除赛事
    await db.query('DELETE FROM events WHERE id = $1', [eventId]);
    
    res.json({ message: '赛事删除成功' });
  } catch (error) {
    console.error('删除赛事错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 根据状态获取赛事
exports.getEventsByStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const result = await db.query(
      'SELECT e.*, COUNT(c.id) as comment_count FROM events e LEFT JOIN event_comments c ON e.id = c.event_id WHERE LOWER(e.status) = LOWER($1) GROUP BY e.id ORDER BY e.date ASC',
      [status]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('获取赛事列表错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 根据日期范围获取赛事
exports.getEventsByDateRange = async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: '必须提供开始日期和结束日期' });
    }
    
    const result = await db.query(
      `SELECT e.*, COUNT(c.id) as comment_count 
       FROM events e 
       LEFT JOIN event_comments c ON e.id = c.event_id 
       WHERE e.date >= $1 AND e.date <= $2 
       GROUP BY e.id 
       ORDER BY e.date ASC`,
      [startDate, endDate]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('获取赛事列表错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 获取即将到来的赛事
exports.getUpcomingEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const today = new Date().toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
    
    const result = await db.query(
      `SELECT e.*, COUNT(c.id) as comment_count 
       FROM events e 
       LEFT JOIN event_comments c ON e.id = c.event_id 
       WHERE e.date >= $1 AND e.status = '计划中' 
       GROUP BY e.id 
       ORDER BY e.date ASC 
       LIMIT $2`,
      [today, limit]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('获取即将到来的赛事错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 根据地点获取赛事
exports.getEventsByLocation = async (req, res) => {
  try {
    const location = req.params.location;
    
    const result = await db.query(
      `SELECT e.*, COUNT(c.id) as comment_count 
       FROM events e 
       LEFT JOIN event_comments c ON e.id = c.event_id 
       WHERE LOWER(e.location) LIKE LOWER($1) 
       GROUP BY e.id 
       ORDER BY e.date ASC`,
      [`%${location}%`]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('获取赛事列表错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

exports.getEventSchedules = async (req, res) => {
  try {
    const eventId = req.params.id;
    const result = await db.query(
      `SELECT es.*, 
              (SELECT COUNT(*) FROM event_results er WHERE er.schedule_id = es.id) as result_count
       FROM event_schedules es
       WHERE es.event_id = $1
       ORDER BY es.event_date ASC, es.event_time ASC`,
      [eventId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('获取比赛项目错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

exports.getEventResults = async (req, res) => {
  try {
    const scheduleId = req.params.scheduleId;
    const result = await db.query(
      `SELECT er.* 
       FROM event_results er
       WHERE er.schedule_id = $1
       ORDER BY er.rank ASC NULLS LAST`,
      [scheduleId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('获取比赛结果错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

exports.getScheduleById = async (req, res) => {
  try {
    const scheduleId = req.params.scheduleId;
    const result = await db.query(
      `SELECT es.*, e.name as event_name, e.location as event_location
       FROM event_schedules es
       JOIN events e ON es.event_id = e.id
       WHERE es.id = $1`,
      [scheduleId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '比赛项目未找到' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('获取比赛项目详情错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { event_id, event_name, event_date, event_time, venue, status, description } = req.body;
    
    const result = await db.query(
      `INSERT INTO event_schedules (event_id, event_name, event_date, event_time, venue, status, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [event_id, event_name, event_date, event_time, venue, status || '未开始', description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('创建比赛项目错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.scheduleId;
    const { event_name, event_date, event_time, venue, status, description } = req.body;
    
    const result = await db.query(
      `UPDATE event_schedules 
       SET event_name = $1, event_date = $2, event_time = $3, venue = $4, status = $5, description = $6, updated_at = NOW()
       WHERE id = $7 
       RETURNING *`,
      [event_name, event_date, event_time, venue, status, description, scheduleId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '比赛项目未找到' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('更新比赛项目错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.scheduleId;
    
    await db.query('DELETE FROM event_results WHERE schedule_id = $1', [scheduleId]);
    
    const result = await db.query('DELETE FROM event_schedules WHERE id = $1 RETURNING *', [scheduleId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '比赛项目未找到' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('删除比赛项目错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

exports.createResult = async (req, res) => {
  try {
    const { schedule_id, athlete_name, country, rank, score, result_detail } = req.body;
    
    const result = await db.query(
      `INSERT INTO event_results (schedule_id, athlete_name, country, rank, score, result_detail)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [schedule_id, athlete_name, country, rank, score, result_detail]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('创建比赛结果错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const resultId = req.params.resultId;
    const { athlete_name, country, rank, score, result_detail } = req.body;
    
    const result = await db.query(
      `UPDATE event_results 
       SET athlete_name = $1, country = $2, rank = $3, score = $4, result_detail = $5, updated_at = NOW()
       WHERE id = $6 
       RETURNING *`,
      [athlete_name, country, rank, score, result_detail, resultId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '比赛结果未找到' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('更新比赛结果错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    const resultId = req.params.resultId;
    
    const result = await db.query('DELETE FROM event_results WHERE id = $1 RETURNING *', [resultId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '比赛结果未找到' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('删除比赛结果错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};