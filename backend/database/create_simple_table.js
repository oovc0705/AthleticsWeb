const { Client } = require('pg');

async function createSimpleTable() {
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

    // 创建表的SQL语句（简化的版本）
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS admin_operation_logs (
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
      );
    `;

    // 执行SQL
    await client.query(createTableSQL);
    console.log('Table created successfully');

    // 插入测试数据
    await client.query(`
      INSERT INTO admin_operation_logs (admin_name, operation_type, target_type, target_id, target_title, target_content, source_page)
      VALUES ('admin', 'create', 'news', 1, '测试新闻', '{"title":"测试新闻","content":"这是一个测试"}', '/news/1')
    `);
    console.log('Test data inserted');

    await client.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error.message);
    await client.end();
  }
}

createSimpleTable();