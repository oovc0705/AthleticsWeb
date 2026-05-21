const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'webclone',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password'
});

pool.on('error', (err) => {
    console.error('数据库连接池错误:', err);
});

const logConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'webclone',
    user: process.env.DB_USER || 'postgres'
};

pool.query('SELECT 1').catch((err) => {
    console.error('数据库连接测试失败:', { ...logConfig, message: err.message, code: err.code });
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};
