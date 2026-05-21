const db = require('./database/db');

const sampleData = {
  schedules: [
    {
      event_id: 1,
      event_name: '男子100米短跑',
      event_date: '2025-01-15',
      event_time: '09:00',
      venue: '主体育场',
      status: '已结束',
      description: '男子100米短跑预赛及决赛'
    },
    {
      event_id: 1,
      event_name: '女子跳远',
      event_date: '2025-01-15',
      event_time: '10:30',
      venue: '主体育场',
      status: '已结束',
      description: '女子跳远资格赛及决赛'
    },
    {
      event_id: 1,
      event_name: '男子4x100米接力',
      event_date: '2025-01-15',
      event_time: '14:00',
      venue: '主体育场',
      status: '进行中',
      description: '男子4x100米接力决赛'
    },
    {
      event_id: 1,
      event_name: '女子800米',
      event_date: '2025-01-16',
      event_time: '09:00',
      venue: '主体育场',
      status: '未开始',
      description: '女子800米预赛'
    },
    {
      event_id: 1,
      event_name: '男子跳高',
      event_date: '2025-01-16',
      event_time: '10:30',
      venue: '主体育场',
      status: '未开始',
      description: '男子跳高资格赛'
    },
    {
      event_id: 1,
      event_name: '女子400米栏',
      event_date: '2025-01-16',
      event_time: '14:00',
      venue: '主体育场',
      status: '未开始',
      description: '女子400米栏决赛'
    },
    {
      event_id: 1,
      event_name: '男子200米短跑',
      event_date: '2025-01-17',
      event_time: '09:00',
      venue: '主体育场',
      status: '未开始',
      description: '男子200米短跑半决赛'
    },
    {
      event_id: 1,
      event_name: '女子标枪',
      event_date: '2025-01-17',
      event_time: '10:30',
      venue: '主体育场',
      status: '未开始',
      description: '女子标枪资格赛'
    },
    {
      event_id: 1,
      event_name: '男子5000米长跑',
      event_date: '2025-01-17',
      event_time: '15:00',
      venue: '主体育场',
      status: '未开始',
      description: '男子5000米长跑决赛'
    },
    {
      event_id: 1,
      event_name: '女子三级跳远',
      event_date: '2025-01-18',
      event_time: '09:00',
      venue: '主体育场',
      status: '未开始',
      description: '女子三级跳远决赛'
    },
    {
      event_id: 1,
      event_name: '男子110米栏',
      event_date: '2025-01-18',
      event_time: '10:30',
      venue: '主体育场',
      status: '未开始',
      description: '男子110米栏半决赛'
    },
    {
      event_id: 1,
      event_name: '女子1500米',
      event_date: '2025-01-18',
      event_time: '14:00',
      venue: '主体育场',
      status: '未开始',
      description: '女子1500米决赛'
    }
  ],
  results: [
    {
      schedule_id: 1,
      athlete_name: '张三',
      country: '中国',
      rank: 1,
      score: '9.89秒',
      result_detail: '起跑反应时间: 0.145秒，分段成绩: 10.23秒/9.89秒'
    },
    {
      schedule_id: 1,
      athlete_name: 'John Smith',
      country: '美国',
      rank: 2,
      score: '9.95秒',
      result_detail: '起跑反应时间: 0.152秒，分段成绩: 10.31秒/9.95秒'
    },
    {
      schedule_id: 1,
      athlete_name: '田中太郎',
      country: '日本',
      rank: 3,
      score: '10.02秒',
      result_detail: '起跑反应时间: 0.148秒，分段成绩: 10.40秒/10.02秒'
    },
    {
      schedule_id: 1,
      athlete_name: '李四',
      country: '中国',
      rank: 4,
      score: '10.15秒',
      result_detail: '起跑反应时间: 0.160秒，分段成绩: 10.55秒/10.15秒'
    },
    {
      schedule_id: 1,
      athlete_name: 'Michael Johnson',
      country: '牙买加',
      rank: 5,
      score: '10.22秒',
      result_detail: '起跑反应时间: 0.155秒，分段成绩: 10.60秒/10.22秒'
    },
    {
      schedule_id: 1,
      athlete_name: 'David Wilson',
      country: '英国',
      rank: 6,
      score: '10.35秒',
      result_detail: '起跑反应时间: 0.162秒，分段成绩: 10.75秒/10.35秒'
    },
    {
      schedule_id: 2,
      athlete_name: '王芳',
      country: '中国',
      rank: 1,
      score: '7.12米',
      result_detail: '第一跳: 6.95米，第二跳: 7.12米(个人最佳)，第三跳: 6.88米，第四跳: 7.05米，第五跳: 6.92米，第六跳: 7.08米'
    },
    {
      schedule_id: 2,
      athlete_name: 'Sarah Johnson',
      country: '英国',
      rank: 2,
      score: '7.05米',
      result_detail: '第一跳: 6.82米，第二跳: 7.05米，第三跳: 6.90米，第四跳: 6.98米，第五跳: 7.02米，第六跳: 6.95米'
    },
    {
      schedule_id: 2,
      athlete_name: '佐藤美咲',
      country: '日本',
      rank: 3,
      score: '6.98米',
      result_detail: '第一跳: 6.75米，第二跳: 6.98米，第三跳: 6.85米，第四跳: 6.92米，第五跳: 6.80米，第六跳: 6.88米'
    },
    {
      schedule_id: 2,
      athlete_name: 'Emily Brown',
      country: '美国',
      rank: 4,
      score: '6.89米',
      result_detail: '第一跳: 6.70米，第二跳: 6.89米，第三跳: 6.82米，第四跳: 6.78米，第五跳: 6.85米，第六跳: 6.80米'
    },
    {
      schedule_id: 2,
      athlete_name: '刘娜',
      country: '中国',
      rank: 5,
      score: '6.85米',
      result_detail: '第一跳: 6.65米，第二跳: 6.85米，第三跳: 6.78米，第四跳: 6.72米，第五跳: 6.80米，第六跳: 6.75米'
    }
  ]
};

async function insertSampleData() {
  try {
    console.log('开始插入测试数据...');

    for (const schedule of sampleData.schedules) {
      const result = await db.query(
        `INSERT INTO event_schedules (event_id, event_name, event_date, event_time, venue, status, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [schedule.event_id, schedule.event_name, schedule.event_date, schedule.event_time, schedule.venue, schedule.status, schedule.description]
      );
      
      const scheduleId = result.rows[0].id;
      console.log(`插入比赛项目: ${schedule.event_name} (ID: ${scheduleId})`);

      const scheduleResults = sampleData.results.filter(r => r.schedule_id === sampleData.schedules.indexOf(schedule) + 1);
      for (const result of scheduleResults) {
        await db.query(
          `INSERT INTO event_results (schedule_id, athlete_name, country, rank, score, result_detail)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [scheduleId, result.athlete_name, result.country, result.rank, result.score, result.result_detail]
        );
        console.log(`  - 插入结果: ${result.athlete_name} - 第${result.rank}名`);
      }
    }

    console.log('测试数据插入完成！');
  } catch (error) {
    console.error('插入测试数据失败:', error);
  } finally {
    process.exit();
  }
}

insertSampleData();
