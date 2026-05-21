const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();
const authMiddleware = require('../middleware/authMiddleware');

// 创建数据库连接池
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'webclone',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password'
});

// 内存中的验证码存储（生产环境应使用Redis或数据库）
const captchaStore = new Map();

// 验证码过期时间（10分钟）
const CAPTCHA_EXPIRE_TIME = 10 * 60 * 1000;

// 登录功能
exports.login = async (req, res) => {
  const { username, email, password } = req.body;

  // 验证输入
  if (!password) {
    return res.status(400).json({
      success: false,
      error: '密码不能为空'
    });
  }

  if (!username && !email) {
    return res.status(400).json({
      success: false,
      error: '用户名或邮箱不能为空'
    });
  }

  try {
    // 从数据库查找用户，支持用户名或邮箱
    let result;
    if (username && email) {
      // 同时提供了用户名和邮箱，两种方式都尝试
      result = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    } else if (username) {
      // 只提供了用户名
      result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    } else {
      // 只提供了邮箱
      result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    }
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: '用户名/邮箱或密码错误'
      });
    }

    const user = result.rows[0];
    
    // 检查密码是否是加密的（bcrypt哈希通常以$2b$开头）
    if (user.password.startsWith('$2b$')) {
      // 使用bcrypt验证加密密码
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('密码验证错误:', err);
          return res.status(500).json({
            success: false,
            error: '服务器内部错误，请稍后重试'
          });
        }

        if (!isMatch) {
          return res.status(401).json({
            success: false,
            error: '用户名/邮箱或密码错误'
          });
        }

        // 返回用户信息和令牌（不包含密码）
        const { password: _, ...userWithoutPassword } = user;
        const token = authMiddleware.generateToken(userWithoutPassword);
        res.json({
          success: true,
          user: userWithoutPassword,
          token: token
        });
      });
    } else {
      // 直接比较明文密码（用于兼容旧数据）
      if (password === user.password) {
        // 返回用户信息和令牌（不包含密码）
        const { password: _, ...userWithoutPassword } = user;
        const token = authMiddleware.generateToken(userWithoutPassword);
        res.json({
          success: true,
          user: userWithoutPassword,
          token: token
        });
      } else {
        return res.status(401).json({
          success: false,
          error: '用户名/邮箱或密码错误'
        });
      }
    }
  } catch (error) {
    console.error('登录处理错误:', error);
    return res.status(500).json({
      success: false,
      error: '服务器内部错误，请稍后重试'
    });
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    // 从认证中间件获取用户ID
    if (!req.user) {
      return res.status(401).json({ error: '用户未认证' });
    }

    // 从数据库获取用户完整信息，包含 country 字段
    const result = await pool.query(
      'SELECT id, username, email, role, country, created_at, updated_at FROM users WHERE id = $1', 
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json(user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return res.status(500).json({
      success: false,
      error: '服务器内部错误，请稍后重试'
    });
  }
};

// 更新用户信息
exports.updateUserInfo = async (req, res) => {
  try {
    // 从认证中间件获取用户ID
    if (!req.user) {
      return res.status(401).json({ error: '用户未认证' });
    }

    const { username } = req.body;
    
    // 验证输入
    if (!username) {
      return res.status(400).json({
        success: false,
        error: '用户名不能为空'
      });
    }

    // 检查用户名是否已被其他用户使用
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND id != $2', 
      [username, req.user.id]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: '该用户名已被使用'
      });
    }

    // 更新用户信息
    const result = await pool.query(
      'UPDATE users SET username = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, email, role, created_at, updated_at', 
      [username, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = result.rows[0];
    res.json({
      success: true,
      user: updatedUser,
      message: '用户信息更新成功'
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    return res.status(500).json({
      success: false,
      error: '服务器内部错误，请稍后重试'
    });
  }
};

// 发送验证码功能
exports.sendCaptcha = (req, res) => {
  const { email } = req.body;

  try {
    // 生成6位随机数字验证码
    const captcha = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 存储验证码，包含过期时间
    captchaStore.set(email, {
      code: captcha,
      expiresAt: Date.now() + CAPTCHA_EXPIRE_TIME
    });

    // 这里应该集成邮件发送服务（如nodemailer）
    // 由于是演示环境，我们只在控制台输出验证码
    console.log(`向邮箱 ${email} 发送验证码: ${captcha}`);

    // 返回成功响应
    res.json({
      success: true,
      message: '验证码已发送到您的邮箱'
    });
  } catch (error) {
    console.error('发送验证码错误:', error);
    return res.status(500).json({
      success: false,
      error: '发送验证码失败，请稍后重试'
    });
  }
};

// 注册功能
exports.register = async (req, res) => {
  console.log('Register request body:', req.body);
  const { name, email, password } = req.body;

  // 验证输入
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: '用户名、邮箱和密码都不能为空'
    });
  }

  // 验证密码长度
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: '密码长度不能少于6位'
    });
  }

  try {
    // 检查邮箱是否已存在
    const existingEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: '该邮箱已被注册'
      });
    }
    
    // 检查用户名是否已存在
    const existingUsername = await pool.query('SELECT * FROM users WHERE username = $1', [name]);
    if (existingUsername.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: '该用户名已被注册'
      });
    }

    // 使用bcrypt异步加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建新用户（默认角色为user）
    const newUserResult = await pool.query(
      `INSERT INTO users (username, email, password, role, country, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, username, email, role, country, created_at, updated_at`,
      [name, email, hashedPassword, 'user', req.body.country || 'CN', new Date(), new Date()]
    );

    const newUser = newUserResult.rows[0];

    // 返回新用户信息（不包含密码）
    res.status(201).json({
      success: true,
      user: newUser,
      message: '注册成功'
    });
  } catch (error) {
    console.error('注册处理错误:', error);
    
    // 处理唯一约束错误
    if (error.code === '23505') {
      if (error.constraint === 'users_email_key') {
        return res.status(409).json({
          success: false,
          error: '该邮箱已被注册'
        });
      } else if (error.constraint === 'users_username_key') {
        return res.status(409).json({
          success: false,
          error: '该用户名已被注册'
        });
      }
    }
    
    // 其他错误返回服务器错误
    return res.status(500).json({
      success: false,
      error: '服务器内部错误，请稍后重试'
    });
  }
};

// 更新用户信息
exports.updateUserInfo = async (req, res) => {
  try {
    // 从认证中间件获取用户ID
    if (!req.user) {
      return res.status(401).json({ error: '用户未认证' });
    }

    const { username } = req.body;
    
    // 验证输入
    if (!username) {
      return res.status(400).json({
        success: false,
        error: '用户名不能为空'
      });
    }

    // 检查用户名是否已被其他用户使用
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND id != $2', 
      [username, req.user.id]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: '该用户名已被使用'
      });
    }

    // 更新用户信息
    const result = await pool.query(
      'UPDATE users SET username = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email, role, created_at, updated_at', 
      [username, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = result.rows[0];
    res.json({
      success: true,
      user: updatedUser,
      message: '用户信息更新成功'
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    return res.status(500).json({
      success: false,
      error: '服务器内部错误，请稍后重试',
      details: error.message // 添加错误详情，便于调试
    });
  }
};