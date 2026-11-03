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

/**
 * 在单个数据库连接上执行事务。
 * 注意：不能对 pool.query 直接发 BEGIN/COMMIT——每次调用可能拿到不同连接，事务不生效。
 * @param {(tx: (text: string, params?: Array) => Promise) => Promise} callback
 */
async function withTransaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback((text, params) => client.query(text, params));
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    withTransaction
};
