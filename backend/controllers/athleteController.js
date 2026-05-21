// 引入中间件和数据库
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

// 获取所有运动员
exports.getAllAthletes = async (req, res) => {
  try {
    const search = req.query.search;

    let query = `
      SELECT a.*, s.gold_medals, s.silver_medals, s.bronze_medals, s.world_records, s.personal_best
      FROM athletes a
      LEFT JOIN athlete_stats s ON a.id = s.athlete_id
    `;

    let queryParams = [];

    if (search && search.trim()) {
      query += ` WHERE LOWER(a.name) LIKE LOWER($1) OR LOWER(a.sport) LIKE LOWER($1) OR LOWER(a.country) LIKE LOWER($1)`;
      queryParams.push(`%${search.trim()}%`);
    }

    query += ` ORDER BY a.name ASC`;

    const result = await db.query(query, queryParams);
    
    const athletesWithAchievements = await Promise.all(result.rows.map(async (athlete) => {
      const achievementsResult = await db.query(
        'SELECT achievement FROM athlete_achievements WHERE athlete_id = $1',
        [athlete.id]
      );
      
      return {
        ...athlete,
        achievements: achievementsResult.rows.map(row => row.achievement),
        stats: {
          goldMedals: athlete.gold_medals,
          silverMedals: athlete.silver_medals,
          bronzeMedals: athlete.bronze_medals,
          worldRecords: athlete.world_records,
          personalBest: athlete.personal_best
        }
      };
    }));
    
    res.json(athletesWithAchievements);
  } catch (error) {
    console.error('获取运动员列表错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 根据ID获取运动员
exports.getAthleteById = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, s.gold_medals, s.silver_medals, s.bronze_medals, s.world_records, s.personal_best
      FROM athletes a
      LEFT JOIN athlete_stats s ON a.id = s.athlete_id
      WHERE a.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '运动员不存在' });
    }
    
    const athlete = result.rows[0];
    
    // 获取运动员成就
    const achievementsResult = await db.query(
      'SELECT achievement FROM athlete_achievements WHERE athlete_id = $1',
      [athlete.id]
    );
    
    res.json({
      ...athlete,
      achievements: achievementsResult.rows.map(row => row.achievement),
      stats: {
        goldMedals: athlete.gold_medals,
        silverMedals: athlete.silver_medals,
        bronzeMedals: athlete.bronze_medals,
        worldRecords: athlete.world_records,
        personalBest: athlete.personal_best
      }
    });
  } catch (error) {
    console.error('获取运动员信息错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 创建新运动员
exports.createAthlete = async (req, res) => {
  try {
    const { name, sport, country, age, biography, stats, achievements } = req.body;
    
    // 插入运动员基本信息
    const result = await db.query(
      `INSERT INTO athletes (name, sport, country, age, biography, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [name, sport, country, age, biography]
    );
    
    const athlete = result.rows[0];
    
    // 插入统计信息
    if (stats) {
      await db.query(
        `INSERT INTO athlete_stats (athlete_id, gold_medals, silver_medals, bronze_medals, world_records, personal_best)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          athlete.id,
          stats.goldMedals || 0,
          stats.silverMedals || 0,
          stats.bronzeMedals || 0,
          stats.worldRecords || 0,
          stats.personalBest || ''
        ]
      );
    }
    
    // 插入成就
    if (Array.isArray(achievements)) {
      for (const achievement of achievements) {
        await db.query(
          'INSERT INTO athlete_achievements (athlete_id, achievement) VALUES ($1, $2)',
          [athlete.id, achievement]
        );
      }
    }
    
    // 记录创建操作
    try {
      await recordOperation(req, {
        operationType: 'create',
        targetType: 'athlete',
        targetId: athlete.id,
        targetTitle: athlete.name,
        targetContent: {
          ...athlete,
          stats: stats || {},
          achievements: achievements || []
        },
        sourcePage: `/athletes/${athlete.id}`
      });
    } catch (logError) {
      console.error('记录创建操作失败:', logError);
      // 不影响主要功能，继续执行
    }
    
    res.status(201).json({
      ...athlete,
      stats: stats || {},
      achievements: achievements || []
    });
  } catch (error) {
    console.error('创建运动员错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 更新运动员信息
exports.updateAthlete = async (req, res) => {
  try {
    const athleteId = req.params.id;
    
    // 检查运动员是否存在
    const existingResult = await db.query('SELECT * FROM athletes WHERE id = $1', [athleteId]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: '运动员不存在' });
    }
    
    const { name, sport, country, age, biography, stats, achievements } = req.body;
    
    // 获取更新前的数据用于记录操作
    const originalAthlete = existingResult.rows[0];
    
    // 获取更新前的成就
    const originalAchievementsResult = await db.query(
      'SELECT achievement FROM athlete_achievements WHERE athlete_id = $1',
      [athleteId]
    );
    const originalAchievements = originalAchievementsResult.rows.map(row => row.achievement);
    
    // 获取更新前的统计信息
    const originalStatsResult = await db.query(
      'SELECT * FROM athlete_stats WHERE athlete_id = $1',
      [athleteId]
    );
    let originalStats = {};
    if (originalStatsResult.rows.length > 0) {
      const stats = originalStatsResult.rows[0];
      originalStats = {
        goldMedals: stats.gold_medals,
        silverMedals: stats.silver_medals,
        bronzeMedals: stats.bronze_medals,
        worldRecords: stats.world_records,
        personalBest: stats.personal_best
      };
    }
    
    // 更新运动员基本信息
    await db.query(
      `UPDATE athletes SET name = $1, sport = $2, country = $3, age = $4, biography = $5, updated_at = NOW()
       WHERE id = $6`,
      [name, sport, country, age, biography, athleteId]
    );
    
    // 更新统计信息
    if (stats) {
      const statsResult = await db.query(
        'SELECT * FROM athlete_stats WHERE athlete_id = $1',
        [athleteId]
      );
      
      if (statsResult.rows.length > 0) {
        // 更新现有统计
        await db.query(
          `UPDATE athlete_stats SET 
           gold_medals = $1, silver_medals = $2, bronze_medals = $3, 
           world_records = $4, personal_best = $5
           WHERE athlete_id = $6`,
          [
            stats.goldMedals !== undefined ? stats.goldMedals : statsResult.rows[0].gold_medals,
            stats.silverMedals !== undefined ? stats.silverMedals : statsResult.rows[0].silver_medals,
            stats.bronzeMedals !== undefined ? stats.bronzeMedals : statsResult.rows[0].bronze_medals,
            stats.worldRecords !== undefined ? stats.worldRecords : statsResult.rows[0].world_records,
            stats.personalBest !== undefined ? stats.personalBest : statsResult.rows[0].personal_best,
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
            stats.goldMedals || 0,
            stats.silverMedals || 0,
            stats.bronzeMedals || 0,
            stats.worldRecords || 0,
            stats.personalBest || ''
          ]
        );
      }
    }
    
    // 更新成就
    if (Array.isArray(achievements)) {
      // 先删除现有成就
      await db.query('DELETE FROM athlete_achievements WHERE athlete_id = $1', [athleteId]);
      
      // 插入新成就
      for (const achievement of achievements) {
        await db.query(
          'INSERT INTO athlete_achievements (athlete_id, achievement) VALUES ($1, $2)',
          [athleteId, achievement]
        );
      }
    }
    
    // 获取更新后的运动员信息
    const updatedResult = await db.query(`
      SELECT a.*, s.gold_medals, s.silver_medals, s.bronze_medals, s.world_records, s.personal_best
      FROM athletes a
      LEFT JOIN athlete_stats s ON a.id = s.athlete_id
      WHERE a.id = $1
    `, [athleteId]);
    
    const updatedAthlete = updatedResult.rows[0];
    
    // 获取更新后的成就
    const achievementsResult = await db.query(
      'SELECT achievement FROM athlete_achievements WHERE athlete_id = $1',
      [athleteId]
    );
    
    // 记录更新操作
    try {
      await recordOperation(req, {
        operationType: 'update',
        targetType: 'athlete',
        targetId: athleteId,
        targetTitle: updatedAthlete.name,
        targetContent: {
          ...updatedAthlete,
          achievements: achievementsResult.rows.map(row => row.achievement),
          stats: {
            goldMedals: updatedAthlete.gold_medals,
            silverMedals: updatedAthlete.silver_medals,
            bronzeMedals: updatedAthlete.bronze_medals,
            worldRecords: updatedAthlete.world_records,
            personalBest: updatedAthlete.personal_best
          }
        },
        originalContent: {
          ...originalAthlete,
          achievements: originalAchievements,
          stats: originalStats
        },
        sourcePage: `/athletes/${athleteId}`
      });
    } catch (logError) {
      console.error('记录更新操作失败:', logError);
      // 不影响主要功能，继续执行
    }
    
    res.json({
      ...updatedAthlete,
      achievements: achievementsResult.rows.map(row => row.achievement),
      stats: {
        goldMedals: updatedAthlete.gold_medals,
        silverMedals: updatedAthlete.silver_medals,
        bronzeMedals: updatedAthlete.bronze_medals,
        worldRecords: updatedAthlete.world_records,
        personalBest: updatedAthlete.personal_best
      }
    });
  } catch (error) {
    console.error('更新运动员信息错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 删除运动员
exports.deleteAthlete = async (req, res) => {
  try {
    const athleteId = req.params.id;
    
    // 检查运动员是否存在
    const result = await db.query('SELECT * FROM athletes WHERE id = $1', [athleteId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '运动员不存在' });
    }
    
    const athleteToDelete = result.rows[0];
    
    // 获取运动员统计信息
    const statsResult = await db.query(
      'SELECT * FROM athlete_stats WHERE athlete_id = $1',
      [athleteId]
    );
    let athleteStats = {};
    if (statsResult.rows.length > 0) {
      const stats = statsResult.rows[0];
      athleteStats = {
        goldMedals: stats.gold_medals,
        silverMedals: stats.silver_medals,
        bronzeMedals: stats.bronze_medals,
        worldRecords: stats.world_records,
        personalBest: stats.personal_best
      };
    }
    
    // 获取运动员成就
    const achievementsResult = await db.query(
      'SELECT achievement FROM athlete_achievements WHERE athlete_id = $1',
      [athleteId]
    );
    const athleteAchievements = achievementsResult.rows.map(row => row.achievement);
    
    // 记录删除操作（在实际删除之前）
    try {
      await recordOperation(req, {
        operationType: 'delete',
        targetType: 'athlete',
        targetId: athleteId,
        targetTitle: athleteToDelete.name,
        targetContent: {
          ...athleteToDelete,
          stats: athleteStats,
          achievements: athleteAchievements
        },
        sourcePage: `/athletes/${athleteId}`
      });
    } catch (logError) {
      console.error('记录删除操作失败:', logError);
      // 不影响主要功能，继续执行
    }
    
    // 删除相关的统计信息和成就
    await db.query('DELETE FROM athlete_stats WHERE athlete_id = $1', [athleteId]);
    await db.query('DELETE FROM athlete_achievements WHERE athlete_id = $1', [athleteId]);
    
    // 删除运动员
    await db.query('DELETE FROM athletes WHERE id = $1', [athleteId]);
    
    res.json({ message: '运动员删除成功' });
  } catch (error) {
    console.error('删除运动员错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 获取运动员统计信息
exports.getAthleteStats = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM athlete_stats WHERE athlete_id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '运动员统计信息不存在' });
    }
    
    const stats = result.rows[0];
    res.json({
      goldMedals: stats.gold_medals,
      silverMedals: stats.silver_medals,
      bronzeMedals: stats.bronze_medals,
      worldRecords: stats.world_records,
      personalBest: stats.personal_best
    });
  } catch (error) {
    console.error('获取运动员统计信息错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 获取运动员成就
exports.getAthleteAchievements = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT achievement FROM athlete_achievements WHERE athlete_id = $1 ORDER BY id',
      [req.params.id]
    );
    
    const achievements = result.rows.map(row => row.achievement);
    res.json(achievements);
  } catch (error) {
    console.error('获取运动员成就错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 根据国家筛选运动员
exports.getAthletesByCountry = async (req, res) => {
  try {
    const country = req.params.country;
    const result = await db.query(`
      SELECT a.*, s.gold_medals, s.silver_medals, s.bronze_medals, s.world_records, s.personal_best
      FROM athletes a
      LEFT JOIN athlete_stats s ON a.id = s.athlete_id
      WHERE LOWER(a.country) = LOWER($1)
    `, [country]);
    
    // 获取每个运动员的成就
    const athletesWithAchievements = await Promise.all(result.rows.map(async (athlete) => {
      const achievementsResult = await db.query(
        'SELECT achievement FROM athlete_achievements WHERE athlete_id = $1',
        [athlete.id]
      );
      
      return {
        ...athlete,
        achievements: achievementsResult.rows.map(row => row.achievement),
        stats: {
          goldMedals: athlete.gold_medals,
          silverMedals: athlete.silver_medals,
          bronzeMedals: athlete.bronze_medals,
          worldRecords: athlete.world_records,
          personalBest: athlete.personal_best
        }
      };
    }));
    
    res.json(athletesWithAchievements);
  } catch (error) {
    console.error('根据国家筛选运动员错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 根据运动项目筛选运动员
exports.getAthletesBySport = async (req, res) => {
  try {
    const sport = req.params.sport;
    const result = await db.query(`
      SELECT a.*, s.gold_medals, s.silver_medals, s.bronze_medals, s.world_records, s.personal_best
      FROM athletes a
      LEFT JOIN athlete_stats s ON a.id = s.athlete_id
      WHERE LOWER(a.sport) = LOWER($1)
    `, [sport]);
    
    // 获取每个运动员的成就
    const athletesWithAchievements = await Promise.all(result.rows.map(async (athlete) => {
      const achievementsResult = await db.query(
        'SELECT achievement FROM athlete_achievements WHERE athlete_id = $1',
        [athlete.id]
      );
      
      return {
        ...athlete,
        achievements: achievementsResult.rows.map(row => row.achievement),
        stats: {
          goldMedals: athlete.gold_medals,
          silverMedals: athlete.silver_medals,
          bronzeMedals: athlete.bronze_medals,
          worldRecords: athlete.world_records,
          personalBest: athlete.personal_best
        }
      };
    }));
    
    res.json(athletesWithAchievements);
  } catch (error) {
    console.error('根据运动项目筛选运动员错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};

// 获取获得金牌数最多的运动员
exports.getTopGoldMedalists = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const result = await db.query(`
      SELECT a.*, s.gold_medals, s.silver_medals, s.bronze_medals, s.world_records, s.personal_best
      FROM athletes a
      LEFT JOIN athlete_stats s ON a.id = s.athlete_id
      WHERE s.gold_medals IS NOT NULL
      ORDER BY s.gold_medals DESC
      LIMIT $1
    `, [limit]);
    
    // 获取每个运动员的成就
    const athletesWithAchievements = await Promise.all(result.rows.map(async (athlete) => {
      const achievementsResult = await db.query(
        'SELECT achievement FROM athlete_achievements WHERE athlete_id = $1',
        [athlete.id]
      );
      
      return {
        ...athlete,
        achievements: achievementsResult.rows.map(row => row.achievement),
        stats: {
          goldMedals: athlete.gold_medals,
          silverMedals: athlete.silver_medals,
          bronzeMedals: athlete.bronze_medals,
          worldRecords: athlete.world_records,
          personalBest: athlete.personal_best
        }
      };
    }));
    
    res.json(athletesWithAchievements);
  } catch (error) {
    console.error('获取获得金牌数最多的运动员错误:', error);
    res.status(500).json({ error: '服务器内部错误，请稍后重试' });
  }
};