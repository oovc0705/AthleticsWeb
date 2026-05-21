const db = require('./database/db');

const allEventsData = [
  {
    event_id: 2,
    schedules: [
      {
        event_name: '男子100米短跑',
        event_date: '2025-02-20',
        event_time: '09:00',
        venue: '主体育场',
        status: '已结束',
        description: '男子100米短跑预赛及决赛'
      },
      {
        event_name: '女子跳远',
        event_date: '2025-02-20',
        event_time: '10:30',
        venue: '主体育场',
        status: '已结束',
        description: '女子跳远资格赛及决赛'
      },
      {
        event_name: '男子4x100米接力',
        event_date: '2025-02-20',
        event_time: '14:00',
        venue: '主体育场',
        status: '进行中',
        description: '男子4x100米接力决赛'
      },
      {
        event_name: '女子800米',
        event_date: '2025-02-21',
        event_time: '09:00',
        venue: '主体育场',
        status: '未开始',
        description: '女子800米预赛'
      },
      {
        event_name: '男子跳高',
        event_date: '2025-02-21',
        event_time: '10:30',
        venue: '主体育场',
        status: '未开始',
        description: '男子跳高资格赛'
      }
    ],
    results: [
      {
        event_name: '男子100米短跑',
        results: [
          {
            athlete_name: '王强',
            country: '中国',
            rank: 1,
            score: '9.92秒',
            result_detail: '起跑反应时间: 0.142秒，分段成绩: 10.25秒/9.92秒'
          },
          {
            athlete_name: 'Mike Thompson',
            country: '美国',
            rank: 2,
            score: '9.98秒',
            result_detail: '起跑反应时间: 0.148秒，分段成绩: 10.32秒/9.98秒'
          },
          {
            athlete_name: '山本健太',
            country: '日本',
            rank: 3,
            score: '10.05秒',
            result_detail: '起跑反应时间: 0.145秒，分段成绩: 10.40秒/10.05秒'
          }
        ]
      },
      {
        event_name: '女子跳远',
        results: [
          {
            athlete_name: '李雪',
            country: '中国',
            rank: 1,
            score: '7.08米',
            result_detail: '第一跳: 6.92米，第二跳: 7.08米(个人最佳)，第三跳: 6.95米，第四跳: 7.02米，第五跳: 6.90米，第六跳: 7.05米'
          },
          {
            athlete_name: 'Anna Williams',
            country: '英国',
            rank: 2,
            score: '7.00米',
            result_detail: '第一跳: 6.85米，第二跳: 7.00米，第三跳: 6.92米，第四跳: 6.95米，第五跳: 6.88米，第六跳: 6.98米'
          },
          {
            athlete_name: '佐藤由美',
            country: '日本',
            rank: 3,
            score: '6.95米',
            result_detail: '第一跳: 6.78米，第二跳: 6.95米，第三跳: 6.82米，第四跳: 6.88米，第五跳: 6.80米，第六跳: 6.85米'
          }
        ]
      }
    ]
  },
  {
    event_id: 3,
    schedules: [
      {
        event_name: '男子100米短跑',
        event_date: '2025-03-10',
        event_time: '15:00',
        venue: '主体育场',
        status: '已结束',
        description: '男子100米短跑预赛及决赛'
      },
      {
        event_name: '女子跳远',
        event_date: '2025-03-10',
        event_time: '16:30',
        venue: '主体育场',
        status: '已结束',
        description: '女子跳远资格赛及决赛'
      },
      {
        event_name: '男子200米短跑',
        event_date: '2025-03-11',
        event_time: '09:00',
        venue: '主体育场',
        status: '进行中',
        description: '男子200米短跑半决赛'
      },
      {
        event_name: '女子800米',
        event_date: '2025-03-11',
        event_time: '10:30',
        venue: '主体育场',
        status: '未开始',
        description: '女子800米预赛'
      },
      {
        event_name: '男子跳高',
        event_date: '2025-03-11',
        event_time: '14:00',
        venue: '主体育场',
        status: '未开始',
        description: '男子跳高资格赛'
      }
    ],
    results: [
      {
        event_name: '男子100米短跑',
        results: [
          {
            athlete_name: '刘翔',
            country: '中国',
            rank: 1,
            score: '9.90秒',
            result_detail: '起跑反应时间: 0.140秒，分段成绩: 10.20秒/9.90秒'
          },
          {
            athlete_name: 'James Brown',
            country: '美国',
            rank: 2,
            score: '9.96秒',
            result_detail: '起跑反应时间: 0.150秒，分段成绩: 10.28秒/9.96秒'
          },
          {
            athlete_name: '田中一郎',
            country: '日本',
            rank: 3,
            score: '10.00秒',
            result_detail: '起跑反应时间: 0.146秒，分段成绩: 10.35秒/10.00秒'
          }
        ]
      },
      {
        event_name: '女子跳远',
        results: [
          {
            athlete_name: '陈婷',
            country: '中国',
            rank: 1,
            score: '7.15米',
            result_detail: '第一跳: 6.98米，第二跳: 7.15米(个人最佳)，第三跳: 7.02米，第四跳: 7.08米，第五跳: 6.95米，第六跳: 7.10米'
          },
          {
            athlete_name: 'Sarah Miller',
            country: '英国',
            rank: 2,
            score: '7.08米',
            result_detail: '第一跳: 6.90米，第二跳: 7.08米，第三跳: 6.95米，第四跳: 7.02米，第五跳: 6.88米，第六跳: 7.00米'
          },
          {
            athlete_name: '山田美咲',
            country: '日本',
            rank: 3,
            score: '7.02米',
            result_detail: '第一跳: 6.85米，第二跳: 7.02米，第三跳: 6.88米，第四跳: 6.95米，第五跳: 6.82米，第六跳: 6.90米'
          }
        ]
      }
    ]
  }
];

async function insertAllEventData() {
  try {
    console.log('开始为所有赛事添加时间表数据...');

    for (const eventData of allEventsData) {
      console.log(`\n处理赛事 ID: ${eventData.event_id}`);
      
      for (const schedule of eventData.schedules) {
        const result = await db.query(
          `INSERT INTO event_schedules (event_id, event_name, event_date, event_time, venue, status, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [eventData.event_id, schedule.event_name, schedule.event_date, schedule.event_time, schedule.venue, schedule.status, schedule.description]
        );
        
        const scheduleId = result.rows[0].id;
        console.log(`  - 插入比赛项目: ${schedule.event_name} (ID: ${scheduleId})`);

        const eventResults = eventData.results.find(r => r.event_name === schedule.event_name);
        if (eventResults && eventResults.results) {
          for (const result of eventResults.results) {
            await db.query(
              `INSERT INTO event_results (schedule_id, athlete_name, country, rank, score, result_detail)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [scheduleId, result.athlete_name, result.country, result.rank, result.score, result.result_detail]
            );
            console.log(`    - 插入结果: ${result.athlete_name} - 第${result.rank}名`);
          }
        }
      }
    }

    console.log('\n所有赛事时间表数据插入完成！');
  } catch (error) {
    console.error('插入数据失败:', error);
  } finally {
    process.exit();
  }
}

insertAllEventData();
