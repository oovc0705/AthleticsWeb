const { Client } = require('pg');

async function fixAdminLogsTable() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'webclone',
    user: 'postgres',
    password: 'ykfpostgresql'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // 删除旧表
    await client.query('DROP TABLE IF EXISTS admin_operation_logs');
    console.log('Old table dropped');

    // 创建新表，包含所有必需的字段
    const createTableSQL = `
      CREATE TABLE admin_operation_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER,
        admin_name VARCHAR(50) NOT NULL,
        operation_type VARCHAR(20) NOT NULL,
        target_type VARCHAR(20) NOT NULL,
        target_id INTEGER,
        target_title VARCHAR(200),
        target_content TEXT,
        original_content TEXT,
        source_page VARCHAR(100),
        ip_address VARCHAR(100),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client.query(createTableSQL);
    console.log('New table created successfully');

    // 插入测试数据
    await client.query(`
      INSERT INTO admin_operation_logs (admin_name, operation_type, target_type, target_id, target_title, target_content, source_page)
      VALUES ('admin', 'create', 'news', 1, '测试新闻', '{"title":"测试新闻","content":"这是一个测试"}', '/news/1')
    `);
    console.log('Test data inserted');

    // 检查表是否创建成功
    const checkTable = await client.query('SELECT COUNT(*) FROM admin_operation_logs');
    console.log('Number of records in admin_operation_logs:', checkTable.rows[0].count);

    await client.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error.message);
    await client.end();
  }
}

fixAdminLogsTable();