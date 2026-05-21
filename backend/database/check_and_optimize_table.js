const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function checkAndOptimizeTable() {
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

    // 检查admin_operation_logs表是否存在
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_operation_logs'
      )
    `);

    if (!tableExists.rows[0].exists) {
      console.log('admin_operation_logs表不存在，创建新表');
      
      // 创建表
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
        );
      `;
      
      await client.query(createTableSQL);
      console.log('admin_operation_logs表创建成功');
    } else {
      console.log('admin_operation_logs表已存在');
      
      // 检查表结构
      const tableColumns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_operation_logs'
      `);
      
      console.log('当前表结构:');
      tableColumns.rows.forEach(column => {
        console.log(`- ${column.column_name}: ${column.data_type}`);
      });
      
      // 检查是否缺少必要字段
      const requiredColumns = ['id', 'admin_id', 'admin_name', 'operation_type', 'target_type', 'target_id', 'target_title', 'target_content', 'original_content', 'source_page', 'ip_address', 'user_agent', 'created_at'];
      const existingColumns = tableColumns.rows.map(col => col.column_name);
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('缺少以下必要字段:', missingColumns);
        
        // 添加缺少的字段
        for (const column of missingColumns) {
          let alterSQL;
          switch (column) {
            case 'admin_id':
              alterSQL = 'ALTER TABLE admin_operation_logs ADD COLUMN admin_id INTEGER';
              break;
            case 'admin_name':
              alterSQL = 'ALTER TABLE admin_operation_logs ADD COLUMN admin_name VARCHAR(50) NOT NULL DEFAULT \'admin\'';
              break;
            case 'operation_type':
              alterSQL = 'ALTER TABLE admin_operation_logs ADD COLUMN operation_type VARCHAR(20) NOT NULL';
              break;
            case 'target_type':
              alterSQL = 'ALTER TABLE admin_operation_logs ADD COLUMN target_type VARCHAR(20) NOT NULL';
              break;
            case 'target_id':
              alterSQL = 'ALTER TABLE admin_operation_logs ADD COLUMN target_id INTEGER';
              break;
            case 'target_title':
              alterSQL = 'ALTER TABLE admin_operation_logs ADD COLUMN target_title VARCHAR(200)';
              break;
            case 'target_content':
              alterSQL = 'ALTER TABLE admin_operation_logs ADD COLUMN target_content TEXT';
              break;
            case 'original_content':
              alterSQL = 'ALTER TABLE admin_operation_logs ADD COLUMN original_content TEXT';
              break;
            case 'source_page':
              alterSQL = 'ALTER TABLE admin_operation_logs ADD COLUMN source_page VARCHAR(100)';
              break;
            case 'ip_address':
              alterSQL = 'ALTER TABLE admin_operation_logs ADD COLUMN ip_address VARCHAR(100)';
              break;
            case 'user_agent':
              alterSQL = 'ALTER TABLE admin_operation_logs ADD COLUMN user_agent TEXT';
              break;
            case 'created_at':
              alterSQL = 'ALTER TABLE admin_operation_logs ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
              break;
            default:
              alterSQL = `ALTER TABLE admin_operation_logs ADD COLUMN ${column} TEXT`;
          }
          
          await client.query(alterSQL);
          console.log(`添加字段 ${column} 成功`);
        }
      } else {
        console.log('表结构完整，包含所有必要字段');
      }
    }
    
    // 创建索引以提高查询性能
    console.log('创建索引');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_operation_logs(admin_id)',
      'CREATE INDEX IF NOT EXISTS idx_admin_logs_operation_type ON admin_operation_logs(operation_type)',
      'CREATE INDEX IF NOT EXISTS idx_admin_logs_target_type ON admin_operation_logs(target_type)',
      'CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_operation_logs(created_at)'      
    ];
    
    for (const indexSQL of indexes) {
      await client.query(indexSQL);
    }
    
    console.log('索引创建成功');
    console.log('表结构检查和优化完成');
    
    // 插入测试数据
    await client.query(`
      INSERT INTO admin_operation_logs (admin_name, operation_type, target_type, target_id, target_title, target_content, source_page)
      VALUES ('admin', 'create', 'news', 1, '测试新闻', '{"title":"测试新闻","content":"这是一个测试"}', '/news/1')
    `);
    console.log('测试数据插入成功');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

checkAndOptimizeTable();