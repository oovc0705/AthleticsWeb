const { Client } = require('pg');
const fs = require('fs');

async function createTable() {
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

    // 读取SQL文件
    const sqlFile = fs.readFileSync('./database/create_operation_logs.sql', 'utf8');
    console.log('SQL file loaded');
    
    // 执行SQL
    await client.query(sqlFile);
    console.log('Table created successfully');

    // 创建索引
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_operation_logs(admin_id);',
      'CREATE INDEX IF NOT EXISTS idx_admin_logs_operation_type ON admin_operation_logs(operation_type);',
      'CREATE INDEX IF NOT EXISTS idx_admin_logs_target_type ON admin_operation_logs(target_type);',
      'CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_operation_logs(created_at);'
    ];

    for (const index of indexes) {
      await client.query(index);
      console.log(`Index created: ${index}`);
    }

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

createTable();