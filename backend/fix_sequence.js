// 修复events表的序列问题
const db = require('./database/db');

async function fixSequence() {
  try {
    // 查询events表中的最大ID
    const maxIdResult = await db.query('SELECT MAX(id) FROM events;');
    const maxId = maxIdResult.rows[0].max;
    
    console.log('当前events表最大ID:', maxId);
    
    if (maxId) {
      // 重置序列值
      const newSequenceValue = parseInt(maxId) + 1;
      const updateSequenceQuery = `ALTER SEQUENCE events_id_seq RESTART WITH ${newSequenceValue};`;
      await db.query(updateSequenceQuery);
      console.log(`序列已重置，下一个ID将是: ${newSequenceValue}`);
    } else {
      // 如果没有数据，重置序列为1
      await db.query('ALTER SEQUENCE events_id_seq RESTART WITH 1;');
      console.log('events表为空，序列已重置为1');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('修复序列失败:', error);
    process.exit(1);
  }
}

fixSequence();
