// 模拟运动员数据
export const mockAthletes = [
  {
    id: 1,
    name: '苏炳添',
    sport: '100米',
    country: '中国',
    gender: '男',
    environment: '室外',
    birthday: '1989-08-29',
    stats: {
      goldMedals: 5,
      worldRecords: 0,
      personalBest: '9.83秒'
    },
    achievements: [
      '东京奥运会男子100米第六名',
      '亚洲男子100米纪录保持者'
    ],
    biography: '中国短跑运动员，男子100米亚洲纪录保持者，是首位进入奥运会男子100米决赛的中国运动员。',
    career: [
      '2007年进入广东省队',
      '2012年伦敦奥运会男子100米半决赛',
      '2015年北京世锦赛男子100米半决赛',
      '2018年雅加达亚运会男子100米冠军',
      '2021年东京奥运会男子100米第六名'
    ],
    personalBests: [
      { event: '100米', result: '9.83秒', date: '2021-08-01', location: '东京' },
      { event: '60米', result: '6.42秒', date: '2018-02-04', location: '伯明翰' }
    ]
  },
  {
    id: 2,
    name: '巩立姣',
    sport: '铅球',
    country: '中国',
    gender: '女',
    environment: '室外',
    birthday: '1989-01-02',
    stats: {
      goldMedals: 10,
      worldRecords: 0,
      personalBest: '20.58米'
    },
    achievements: [
      '东京奥运会女子铅球金牌',
      '世锦赛三届冠军'
    ],
    biography: '中国女子铅球运动员，是世界上最优秀的铅球选手之一，多次获得世界大赛冠军。',
    career: [
      '2007年大阪世锦赛女子铅球第七名',
      '2012年伦敦奥运会女子铅球银牌',
      '2017年伦敦世锦赛女子铅球冠军',
      '2019年多哈世锦赛女子铅球冠军',
      '2021年东京奥运会女子铅球金牌'
    ],
    personalBests: [
      { event: '铅球', result: '20.58米', date: '2021-06-13', location: '布鲁塞尔' }
    ]
  },
  {
    id: 3,
    name: '刘翔',
    sport: '110米栏',
    country: '中国',
    gender: '男',
    environment: '室外',
    birthday: '1983-07-13',
    stats: {
      goldMedals: 8,
      worldRecords: 1,
      personalBest: '12.88秒'
    },
    achievements: [
      '雅典奥运会男子110米栏金牌',
      '前世界纪录保持者'
    ],
    biography: '中国男子田径队110米栏运动员，是中国体育史上最伟大的运动员之一，曾创造多项世界纪录。',
    career: [
      '2004年雅典奥运会男子110米栏冠军',
      '2006年洛桑田径超级大奖赛男子110米栏冠军并打破世界纪录',
      '2007年大阪世锦赛男子110米栏冠军',
      '2008年北京奥运会因伤退赛',
      '2012年伦敦奥运会因伤退赛',
      '2015年正式退役'
    ],
    personalBests: [
      { event: '110米栏', result: '12.88秒', date: '2006-07-11', location: '洛桑' }
    ]
  },
  {
    id: 4,
    name: '谢震业',
    sport: '200米',
    country: '中国',
    gender: '男',
    environment: '室外',
    birthday: '1993-08-17',
    stats: {
      goldMedals: 3,
      worldRecords: 0,
      personalBest: '19.88秒'
    },
    achievements: [
      '亚运会男子200米冠军',
      '亚洲男子200米纪录保持者'
    ],
    biography: '中国短跑运动员，男子200米亚洲纪录保持者，擅长100米和200米项目。',
    career: [
      '2010年青奥会男子200米冠军',
      '2014年仁川亚运会男子4×100米接力冠军',
      '2018年雅加达亚运会男子200米冠军',
      '2019年钻石联赛伦敦站男子200米冠军',
      '2021年东京奥运会男子4×100米接力第四名'
    ],
    personalBests: [
      { event: '200米', result: '19.88秒', date: '2019-07-21', location: '伦敦' },
      { event: '100米', result: '9.97秒', date: '2018-06-20', location: '马德里' }
    ]
  },
  {
    id: 5,
    name: '葛曼棋',
    sport: '短跑',
    country: '中国',
    gender: '女',
    environment: '室内',
    birthday: '1997-10-13',
    stats: {
      goldMedals: 4,
      worldRecords: 0,
      personalBest: '10.94秒'
    },
    achievements: [
      '亚洲室内田径锦标赛女子60米冠军',
      '全国田径锦标赛女子100米冠军'
    ],
    biography: '中国女子短跑运动员，擅长60米、100米和200米项目，是中国短跑的后起之秀。',
    career: [
      '2016年全国室内田径锦标赛女子60米冠军',
      '2019年亚洲室内田径锦标赛女子60米冠军',
      '2020年全国田径锦标赛女子100米冠军',
      '2021年东京奥运会女子4×100米接力第六名'
    ],
    personalBests: [
      { event: '100米', result: '10.94秒', date: '2021-06-11', location: '绍兴' },
      { event: '200米', result: '22.69秒', date: '2021-06-27', location: '重庆' },
      { event: '60米', result: '7.10秒', date: '2019-02-21', location: '杭州' }
    ]
  },
  {
    id: 6,
    name: '王嘉男',
    sport: '跳远',
    country: '中国',
    gender: '男',
    environment: '室外',
    birthday: '1996-08-27',
    stats: {
      goldMedals: 3,
      worldRecords: 0,
      personalBest: '8.36米'
    },
    achievements: [
      '尤金世锦赛男子跳远冠军',
      '雅加达亚运会男子跳远冠军'
    ],
    biography: '中国男子跳远运动员，是首位获得世锦赛跳远冠军的中国运动员。',
    career: [
      '2014年南京青奥会男子跳远冠军',
      '2018年雅加达亚运会男子跳远冠军',
      '2022年尤金世锦赛男子跳远冠军',
      '2021年东京奥运会男子跳远第六名'
    ],
    personalBests: [
      { event: '跳远', result: '8.36米', date: '2022-07-16', location: '尤金' }
    ]
  }
]