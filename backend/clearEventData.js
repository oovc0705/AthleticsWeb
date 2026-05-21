const db = require('./database/db');

async function clearEventData() {
  try {
    console.log('开始清空比赛项目和结果数据...');
    
    await db.query('DELETE FROM event_results');
    console.log('已清空比赛结果数据');
    
    await db.query('DELETE FROM event_schedules');
    console.log('已清空比赛项目数据');
    
    console.log('数据清空完成！');
  } catch (error) {
    console.error('清空数据失败:', error);
  } finally {
    process.exit();
  }
}

clearEventData();
