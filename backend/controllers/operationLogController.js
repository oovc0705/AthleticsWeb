const db = require('../database/db');

// 记录管理员操作
exports.recordOperation = async (req, res) => {
  try {
    const {
      operationType,
      targetType,
      targetId,
      targetTitle,
      targetContent,
      originalContent,
      sourcePage
    } = req.body;

    const adminId = req.user?.id || null;
    const adminName = req.user?.username || '管理员';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';

    const result = await db.query(
      `INSERT INTO admin_operation_logs 
       (admin_id, admin_name, operation_type, target_type, target_id, target_title, 
        target_content, original_content, source_page, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       RETURNING *`,
      [
        adminId,
        adminName,
        operationType,
        targetType,
        targetId,
        targetTitle,
        targetContent ? JSON.stringify(targetContent) : null,
        originalContent ? JSON.stringify(originalContent) : null,
        sourcePage,
        ipAddress,
        userAgent
      ]
    );

    res.status(201).json({
      success: true,
      message: '操作记录成功',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('记录操作失败:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 获取操作记录列表
exports.getOperationLogs = async (req, res) => {
  try {
    console.log('获取操作记录请求:', req.query);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const operationType = req.query.operationType;
    const targetType = req.query.targetType;
    const adminName = req.query.adminName;
    const searchTerm = req.query.searchTerm;

    let query = `
      SELECT * FROM admin_operation_logs 
      WHERE 1=1
    `;
    let queryParams = [];
    let paramCount = 0;

    // 添加过滤条件
    if (operationType) {
      paramCount++;
      query += ` AND operation_type = $${paramCount}`;
      queryParams.push(operationType);
    }

    if (targetType) {
      paramCount++;
      query += ` AND target_type = $${paramCount}`;
      queryParams.push(targetType);
    }

    if (adminName) {
      paramCount++;
      query += ` AND admin_name = $${paramCount}`;
      queryParams.push(adminName);
    }

    if (searchTerm) {
      paramCount++;
      query += ` AND (target_title ILIKE $${paramCount} OR source_page ILIKE $${paramCount})`;
      queryParams.push(`%${searchTerm}%`);
    }

    // 计算总数
    const countQuery = `SELECT COUNT(*) FROM (${query}) as filtered_logs`;
    console.log('执行总数查询:', countQuery);
    console.log('总数查询参数:', queryParams);
    const countResult = await db.query(countQuery, queryParams);
    const totalLogs = parseInt(countResult.rows[0].count);
    console.log('总数查询结果:', totalLogs);

    // 添加排序和分页
    paramCount++;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    queryParams.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push((page - 1) * limit);

    console.log('执行日志查询:', query);
    console.log('日志查询参数:', queryParams);
    const result = await db.query(query, queryParams);
    console.log('日志查询结果:', result.rows.length);

    // 转换字段格式以匹配前端要求
    const logs = result.rows.map(log => {
      let targetContent = null;
      let originalContent = null;
      
      try {
        if (log.target_content) {
          targetContent = JSON.parse(log.target_content);
        }
        if (log.original_content) {
          originalContent = JSON.parse(log.original_content);
        }
      } catch (jsonError) {
        console.error('解析 JSON 失败:', jsonError);
        console.error('失败的 JSON 数据:', log.target_content || log.original_content);
      }
      
      return {
        id: log.id,
        actionType: log.operation_type,
        targetType: log.target_type,
        targetId: log.target_id,
        operator: log.admin_name,
        createdAt: log.created_at,
        // 保留原始字段，保持向后兼容
        admin_id: log.admin_id,
        admin_name: log.admin_name,
        operation_type: log.operation_type,
        target_title: log.target_title,
        target_content: targetContent,
        original_content: originalContent,
        source_page: log.source_page,
        ip_address: log.ip_address,
        user_agent: log.user_agent
      };
    });

    console.log('返回日志数量:', logs.length);
    res.json({
      logs,
      totalPages: Math.ceil(totalLogs / limit),
      currentPage: page,
      totalLogs
    });
  } catch (error) {
    console.error('获取操作记录失败:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ 
      error: '服务器内部错误，请稍后重试',
      detail: error.message 
    });
  }
};

// 还原操作
exports.restoreOperation = async (req, res) => {
  try {
    const logId = req.params.id;

    // 获取操作记录
    const logResult = await db.query(
      'SELECT * FROM admin_operation_logs WHERE id = $1',
      [logId]
    );

    if (logResult.rows.length === 0) {
      return res.status(404).json({ error: '操作记录不存在' });
    }

    const log = logResult.rows[0];
    
    // 解析内容
    const targetContent = log.target_content ? JSON.parse(log.target_content) : null;
    const originalContent = log.original_content ? JSON.parse(log.original_content) : null;
    
    // 检查内容是否存在
    if (!targetContent && !originalContent) {
      return res.status(400).json({ error: '操作记录中没有找到目标内容' });
    }

    let restoreResult;
    let actionMessage;

    // 根据操作类型执行不同的还原操作
    switch (log.operation_type) {
      case 'delete':
        // DELETE 日志：使用 before 数据重新插入记录
        if (!targetContent) {
          return res.status(400).json({ error: '删除操作记录中没有找到原始内容' });
        }
        
        // 根据目标类型执行不同的还原操作
        switch (log.target_type) {
          case 'athlete':
            restoreResult = await restoreAthlete(targetContent);
            break;
          case 'event':
            restoreResult = await restoreEvent(targetContent);
            break;
          case 'news':
            restoreResult = await restoreNews(targetContent);
            break;
          default:
            return res.status(400).json({ error: '不支持的目标类型' });
        }
        actionMessage = '删除操作已成功还原';
        break;
        
      case 'update':
        // UPDATE 日志：使用 before 数据覆盖当前记录
        if (!originalContent) {
          return res.status(400).json({ error: '更新操作记录中没有找到原始内容' });
        }
        
        // 根据目标类型执行不同的还原操作
        switch (log.target_type) {
          case 'athlete':
            restoreResult = await revertAthleteUpdate(log.target_id, originalContent);
            break;
          case 'event':
            restoreResult = await revertEventUpdate(log.target_id, originalContent);
            break;
          case 'news':
            restoreResult = await revertNewsUpdate(log.target_id, originalContent);
            break;
          default:
            return res.status(400).json({ error: '不支持的目标类型' });
        }
        actionMessage = '更新操作已成功还原';
        break;
        
      case 'create':
        // CREATE 日志：删除当前记录
        // 根据目标类型执行不同的删除操作
        switch (log.target_type) {
          case 'athlete':
            restoreResult = await revertAthleteCreate(log.target_id);
            break;
          case 'event':
            restoreResult = await revertEventCreate(log.target_id);
            break;
          case 'news':
            restoreResult = await revertNewsCreate(log.target_id);
            break;
          default:
            return res.status(400).json({ error: '不支持的目标类型' });
        }
        actionMessage = '创建操作已成功还原';
        break;
        
      default:
        return res.status(400).json({ error: '不支持的操作类型' });
    }

    if (restoreResult.success) {
      // 记录还原操作
      await db.query(
        `INSERT INTO admin_operation_logs 
         (admin_id, admin_name, operation_type, target_type, target_id, target_title, 
          target_content, original_content, source_page, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
        [
          req.user?.id || null,
          req.user?.username || '管理员',
          `restore_${log.operation_type}`,
          log.target_type,
          restoreResult.data.id || log.target_id,
          log.target_title,
          JSON.stringify(restoreResult.data),
          JSON.stringify(log),
          req.originalUrl,
          req.ip || req.connection.remoteAddress,
          req.get('User-Agent') || ''
        ]
      );

      // 清除原操作记录，使其不再显示在操作记录列表中
      await db.query(
        `DELETE FROM admin_operation_logs WHERE id = $1`,
        [logId]
      );

      res.json({
        success: true,
        message: actionMessage,
        data: restoreResult.data
      });
    } else {
      res.status(500).json({ error: restoreResult.error });
    }
  } catch (error) {
    console.error('还原操作失败:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 还原运动员
async function restoreAthlete(athleteData) {
  try {
    // 恢复运动员基本信息
    const athleteResult = await db.query(
      `INSERT INTO athletes (name, sport, country, age, biography, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [
        athleteData.name,
        athleteData.sport,
        athleteData.country,
        athleteData.age,
        athleteData.biography
      ]
    );

    const restoredAthlete = athleteResult.rows[0];

    // 恢复统计数据
    if (athleteData.stats) {
      await db.query(
        `INSERT INTO athlete_stats (athlete_id, gold_medals, silver_medals, bronze_medals, world_records, personal_best)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          restoredAthlete.id,
          athleteData.stats.goldMedals || 0,
          athleteData.stats.silverMedals || 0,
          athleteData.stats.bronzeMedals || 0,
          athleteData.stats.worldRecords || 0,
          athleteData.stats.personalBest || ''
        ]
      );
    }

    // 恢复成就
    if (athleteData.achievements && Array.isArray(athleteData.achievements)) {
      for (const achievement of athleteData.achievements) {
        await db.query(
          'INSERT INTO athlete_achievements (athlete_id, achievement) VALUES ($1, $2)',
          [restoredAthlete.id, achievement]
        );
      }
    }

    return { success: true, data: restoredAthlete };
  } catch (error) {
    console.error('还原运动员失败:', error);
    return { success: false, error: error.message };
  }
}

// 还原赛事
async function restoreEvent(eventData) {
  try {
    const result = await db.query(
      `INSERT INTO events (name, location, date, end_date, type, level, status, description, organizer, image_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [
        eventData.name,
        eventData.location,
        eventData.date,
        eventData.end_date,
        eventData.type,
        eventData.level,
        eventData.status || 'upcoming',
        eventData.description,
        eventData.organizer,
        eventData.image_url
      ]
    );

    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('还原赛事失败:', error);
    return { success: false, error: error.message };
  }
}

// 还原新闻
async function restoreNews(newsData) {
  try {
    const result = await db.query(
      `INSERT INTO news (title, content, author, date, category, status, thumbnail, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        newsData.title,
        newsData.content,
        newsData.author,
        newsData.date,
        newsData.category,
        newsData.status || 'published',
        newsData.thumbnail || newsData.image_url
      ]
    );

    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('还原新闻失败:', error);
    return { success: false, error: error.message };
  }
}

// 还原运动员更新操作
async function revertAthleteUpdate(athleteId, originalContent) {
  try {
    // 检查运动员是否存在
    const existingResult = await db.query('SELECT * FROM athletes WHERE id = $1', [athleteId]);
    if (existingResult.rows.length === 0) {
      return { success: false, error: '运动员不存在' };
    }
    
    // 使用原始数据更新运动员
    await db.query(
      `UPDATE athletes SET 
       name = $1, sport = $2, country = $3, age = $4, biography = $5, updated_at = NOW()
       WHERE id = $6`,
      [
        originalContent.name,
        originalContent.sport,
        originalContent.country,
        originalContent.age,
        originalContent.biography,
        athleteId
      ]
    );
    
    // 更新统计数据
    if (originalContent.stats) {
      // 检查统计数据是否存在
      const statsResult = await db.query('SELECT * FROM athlete_stats WHERE athlete_id = $1', [athleteId]);
      
      if (statsResult.rows.length > 0) {
        // 更新现有统计
        await db.query(
          `UPDATE athlete_stats SET 
           gold_medals = $1, silver_medals = $2, bronze_medals = $3, 
           world_records = $4, personal_best = $5
           WHERE athlete_id = $6`,
          [
            originalContent.stats.goldMedals || 0,
            originalContent.stats.silverMedals || 0,
            originalContent.stats.bronzeMedals || 0,
            originalContent.stats.worldRecords || 0,
            originalContent.stats.personalBest || '',
            athleteId
          ]
        );
      } else {
        // 插入新的统计信息
        await db.query(
          `INSERT INTO athlete_stats (athlete_id, gold_medals, silver_medals, bronze_medals, world_records, personal_best)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            athleteId,
            originalContent.stats.goldMedals || 0,
            originalContent.stats.silverMedals || 0,
            originalContent.stats.bronzeMedals || 0,
            originalContent.stats.worldRecords || 0,
            originalContent.stats.personalBest || ''
          ]
        );
      }
    }
    
    // 更新成就
    if (originalContent.achievements && Array.isArray(originalContent.achievements)) {
      // 先删除现有成就
      await db.query('DELETE FROM athlete_achievements WHERE athlete_id = $1', [athleteId]);
      
      // 插入原始成就
      for (const achievement of originalContent.achievements) {
        await db.query(
          'INSERT INTO athlete_achievements (athlete_id, achievement) VALUES ($1, $2)',
          [athleteId, achievement]
        );
      }
    }
    
    return { success: true, data: { id: athleteId, message: '运动员更新操作已还原' } };
  } catch (error) {
    console.error('还原运动员更新操作失败:', error);
    return { success: false, error: error.message };
  }
}

// 还原赛事更新操作
async function revertEventUpdate(eventId, originalContent) {
  try {
    // 检查赛事是否存在
    const existingResult = await db.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (existingResult.rows.length === 0) {
      return { success: false, error: '赛事不存在' };
    }
    
    // 使用原始数据更新赛事
    await db.query(
      `UPDATE events SET 
       name = $1, date = $2, location = $3, description = $4, image_url = $5, status = $6, level = $7, type = $8, organizer = $9, end_date = $10, updated_at = NOW()
       WHERE id = $11`,
      [
        originalContent.name,
        originalContent.date,
        originalContent.location,
        originalContent.description,
        originalContent.image_url,
        originalContent.status || 'upcoming',
        originalContent.level,
        originalContent.type,
        originalContent.organizer,
        originalContent.end_date,
        eventId
      ]
    );
    
    return { success: true, data: { id: eventId, message: '赛事更新操作已还原' } };
  } catch (error) {
    console.error('还原赛事更新操作失败:', error);
    return { success: false, error: error.message };
  }
}

// 还原新闻更新操作
async function revertNewsUpdate(newsId, originalContent) {
  try {
    // 检查新闻是否存在
    const existingResult = await db.query('SELECT * FROM news WHERE id = $1', [newsId]);
    if (existingResult.rows.length === 0) {
      return { success: false, error: '新闻不存在' };
    }
    
    // 使用原始数据更新新闻
    await db.query(
      `UPDATE news SET 
       title = $1, content = $2, author = $3, category = $4, thumbnail = $5, updated_at = NOW()
       WHERE id = $6`,
      [
        originalContent.title,
        originalContent.content,
        originalContent.author,
        originalContent.category,
        originalContent.thumbnail,
        newsId
      ]
    );
    
    // 更新标签
    if (originalContent.tags && Array.isArray(originalContent.tags)) {
      // 先删除现有标签
      await db.query('DELETE FROM news_tags WHERE news_id = $1', [newsId]);
      
      // 插入原始标签
      for (const tag of originalContent.tags) {
        await db.query(
          'INSERT INTO news_tags (news_id, tag) VALUES ($1, $2)',
          [newsId, tag]
        );
      }
    }
    
    return { success: true, data: { id: newsId, message: '新闻更新操作已还原' } };
  } catch (error) {
    console.error('还原新闻更新操作失败:', error);
    return { success: false, error: error.message };
  }
}

// 还原运动员创建操作
async function revertAthleteCreate(athleteId) {
  try {
    // 检查运动员是否存在
    const existingResult = await db.query('SELECT * FROM athletes WHERE id = $1', [athleteId]);
    if (existingResult.rows.length === 0) {
      return { success: false, error: '运动员不存在' };
    }
    
    // 删除相关的统计信息和成就
    await db.query('DELETE FROM athlete_stats WHERE athlete_id = $1', [athleteId]);
    await db.query('DELETE FROM athlete_achievements WHERE athlete_id = $1', [athleteId]);
    
    // 删除运动员
    await db.query('DELETE FROM athletes WHERE id = $1', [athleteId]);
    
    return { success: true, data: { id: athleteId, message: '运动员创建操作已还原' } };
  } catch (error) {
    console.error('还原运动员创建操作失败:', error);
    return { success: false, error: error.message };
  }
}

// 还原赛事创建操作
async function revertEventCreate(eventId) {
  try {
    // 检查赛事是否存在
    const existingResult = await db.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (existingResult.rows.length === 0) {
      return { success: false, error: '赛事不存在' };
    }
    
    // 删除相关的时间表
    await db.query('DELETE FROM event_schedules WHERE event_id = $1', [eventId]);
    
    // 删除赛事
    await db.query('DELETE FROM events WHERE id = $1', [eventId]);
    
    return { success: true, data: { id: eventId, message: '赛事创建操作已还原' } };
  } catch (error) {
    console.error('还原赛事创建操作失败:', error);
    return { success: false, error: error.message };
  }
}

// 还原新闻创建操作
async function revertNewsCreate(newsId) {
  try {
    // 检查新闻是否存在
    const existingResult = await db.query('SELECT * FROM news WHERE id = $1', [newsId]);
    if (existingResult.rows.length === 0) {
      return { success: false, error: '新闻不存在' };
    }
    
    // 删除相关的评论和标签
    await db.query('DELETE FROM news_comments WHERE news_id = $1', [newsId]);
    await db.query('DELETE FROM news_tags WHERE news_id = $1', [newsId]);
    
    // 删除新闻
    await db.query('DELETE FROM news WHERE id = $1', [newsId]);
    
    return { success: true, data: { id: newsId, message: '新闻创建操作已还原' } };
  } catch (error) {
    console.error('还原新闻创建操作失败:', error);
    return { success: false, error: error.message };
  }
}

// 删除操作记录
exports.deleteOperationLog = async (req, res) => {
  try {
    const logId = req.params.id;

    const result = await db.query(
      'DELETE FROM admin_operation_logs WHERE id = $1 RETURNING *',
      [logId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '操作记录不存在' });
    }

    res.json({ message: '操作记录删除成功' });
  } catch (error) {
    console.error('删除操作记录失败:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 获取操作统计
exports.getOperationStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        operation_type,
        target_type,
        COUNT(*) as count
      FROM admin_operation_logs
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY operation_type, target_type
      ORDER BY count DESC
    `);

    const stats = {};
    result.rows.forEach(row => {
      if (!stats[row.operation_type]) {
        stats[row.operation_type] = {};
      }
      stats[row.operation_type][row.target_type] = parseInt(row.count);
    });

    res.json(stats);
  } catch (error) {
    console.error('获取操作统计失败:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};