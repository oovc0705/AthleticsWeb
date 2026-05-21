export default {
  header: {
    logo: '田径',
    home: '首页',
    athletes: '运动员',
    events: '赛事',
    news: '新闻',
    about: '关于'
  },
  search: {
    placeholder: '搜索赛事、运动员...',
    search: '搜索'
  },
  user: {
    login: '登录/注册',
    logout: '退出登录',
    admin: '管理员',
    user: '用户',
    adminCenter: '管理员中心',
    profile: '个人中心'
  },
  language: {
    zh: '中文',
    en: 'English'
  },
  mobile: {
    menu: '菜单',
    search: '搜索'
  },
  footer: {
    title: '世界田径锦标赛',
    description: '激发潜能，超越极限。汇聚全球最顶尖的运动员，见证速度与力量的巅峰对决。',
    quickLinks: '快速链接',
    eventsSchedule: '赛事日程',
    athletes: '运动员',
    news: '新闻动态',
    aboutUs: '关于我们',
    contactUs: '联系方式',
    subscribe: '订阅新闻',
    subscribeText: '获取最新赛事资讯和独家报道',
    emailPlaceholder: '您的邮箱地址',
    subscribeBtn: '订阅',
    subscribeSuccess: '订阅成功！感谢您的关注。',
    copyright: '© {year} 世界田径锦标赛. 保留所有权利.',
    privacyPolicy: '隐私政策',
    termsOfService: '使用条款',
    cookiePolicy: 'Cookie政策'
  },
  loginModal: {
    loginTitle: '用户登录',
    registerTitle: '用户注册',
    email: '邮箱',
    password: '密码',
    emailPlaceholder: '请输入邮箱',
    passwordPlaceholder: '请输入密码',
    loginBtn: '登录',
    loggingIn: '登录中...',
    noAccount: '还没有账号？',
    registerNow: '立即注册',
    username: '用户名',
    usernamePlaceholder: '请输入用户名',
    passwordMinLength: '请输入密码（至少6位）',
    country: '国家/地区',
    verificationCode: '邮箱验证码',
    verificationCodePlaceholder: '请输入6位验证码',
    getCode: '获取验证码',
    retryAfter: '{seconds}秒后重试',
    registerBtn: '注册',
    registering: '注册中...',
    haveAccount: '已有账号？',
    loginNow: '立即登录',
    verificationCodeError: '请输入6位数字验证码'
  },
  athleteCard: {
    featured: '特色运动员',
    personalBest: 'PB',
    worldRanking: '世界排名',
    goldMedals: '金牌',
    achievements: '主要成就',
    showAll: '查看全部',
    showAllWithCount: '查看全部 {count} 项',
    collapse: '收起',
    viewDetails: '查看资料'
  },
  eventForm: {
    editEvent: '编辑赛事',
    addEvent: '添加赛事',
    name: '名称',
    location: '地点',
    startDate: '开始日期',
    endDate: '结束日期',
    type: '类型',
    typePlaceholder: '例如: 锦标赛',
    status: '状态',
    statusOptions: {
      completed: '已完成',
      ongoing: '进行中',
      planned: '计划中'
    },
    level: '赛事等级',
    levelPlaceholder: '请选择等级',
    levelOptions: {
      highest: 'OG/WA（最高级）',
      df: 'DF',
      dl: 'DL',
      a: 'A',
      b: 'B',
      c: 'C'
    },
    organizer: '组织者',
    description: '描述',
    imageUrl: '图片 URL',
    imageUrlPlaceholder: '/assets/events/default.jpg',
    schedules: '赛事时间表',
    scheduleItem: '比赛项目 {index}',
    removeSchedule: '删除',
    addSchedule: '添加比赛项目',
    eventName: '项目名称',
    eventNamePlaceholder: '例如：100米决赛',
    eventDate: '日期',
    eventTime: '时间',
    venue: '场地',
    venuePlaceholder: '例如：主体育场',
    scheduleStatus: '状态',
    scheduleStatusOptions: {
      notStarted: '未开始',
      inProgress: '进行中',
      finished: '已结束'
    },
    cancel: '取消',
    save: '保存',
    saving: '保存中...'
  },
  favoriteButton: {
    add: '收藏',
    added: '已收藏',
    remove: '取消收藏',
    loginRequired: '请先登录',
    ariaLabelAdd: '收藏',
    ariaLabelRemove: '取消收藏',
    titleAdd: '收藏',
    titleRemove: '取消收藏'
  },
  athleteForm: {
    editAthlete: '编辑运动员',
    addAthlete: '添加运动员',
    name: '姓名',
    sport: '项目',
    country: '国家',
    gender: '性别',
    environment: '环境',
    birthday: '生日',
    age: '年龄 (自动计算)',
    stats: '统计数据',
    goldMedals: '金牌数',
    silverMedals: '银牌数',
    bronzeMedals: '铜牌数',
    worldRecords: '世界纪录数',
    personalBest: '个人最佳',
    achievements: '成就（用逗号分隔）',
    achievementsPlaceholder: '例如: 2024奥运金牌, 2023世锦赛冠军',
    imageUrl: '图片 URL',
    imageUrlPlaceholder: '/assets/athletes/default.webp',
    cancel: '取消',
    save: '保存',
    saving: '保存中...',
    select: '请选择',
    genderOptions: {
      male: '男',
      female: '女'
    },
    environmentOptions: {
      indoor: '室内',
      outdoor: '室外'
    }
  },
  newsForm: {
    editNews: '编辑新闻',
    addNews: '添加新闻',
    title: '标题',
    category: '分类',
    content: '内容',
    date: '日期',
    author: '作者',
    summary: '摘要',
    summaryPlaceholder: '如果不填，将自动从内容截取',
    imageUrl: '图片 URL',
    imageUrlPlaceholder: '/assets/news/default.jpg',
    cancel: '取消',
    save: '保存',
    saving: '保存中...',
    categoryOptions: {
      eventNews: '赛事动态',
      athleteInterview: '运动员专访',
      highlight: '精彩瞬间',
      other: '其他'
    }
  },
  resultForm: {
    editResult: '编辑比赛结果',
    addResult: '添加比赛结果',
    scheduleId: '比赛项目ID',
    athleteName: '运动员姓名 *',
    athleteNamePlaceholder: '例如：张三',
    country: '国家/地区',
    countryPlaceholder: '例如：中国',
    rank: '排名 *',
    rankPlaceholder: '1',
    score: '成绩 *',
    scorePlaceholder: '例如：9.89秒 或 7.12米',
    resultDetail: '详细成绩',
    resultDetailPlaceholder: '详细成绩说明...',
    cancel: '取消',
    save: '保存',
    saving: '保存中...',
    update: '更新',
    add: '添加'
  },
  scheduleForm: {
    editSchedule: '编辑比赛项目',
    addSchedule: '添加比赛项目',
    eventId: '赛事ID',
    eventName: '项目名称 *',
    eventNamePlaceholder: '例如：男子100米短跑',
    eventDate: '比赛日期 *',
    eventTime: '比赛时间',
    venue: '比赛场地',
    venuePlaceholder: '例如：主体育场',
    status: '比赛状态',
    statusOptions: {
      notStarted: '未开始',
      inProgress: '进行中',
      finished: '已结束'
    },
    description: '项目描述',
    descriptionPlaceholder: '项目说明...',
    cancel: '取消',
    save: '保存',
    saving: '保存中...',
    update: '更新',
    add: '添加'
  },
  home: {
    hero: {
      title: '激发潜能，超越极限',
      subtitle: '世界田径锦标赛汇聚全球最顶尖的运动员，见证速度与力量的巅峰对决。',
      viewEvents: '查看赛事日程',
      exploreAthletes: '探索运动员'
    },
    events: {
      upcoming: '即将举行的赛事',
      loading: '加载中...',
      error: '获取赛事数据失败: ',
      noData: '暂无赛事数据',
      refresh: '刷新',
      retry: '重试',
      location: '地点:',
      date: '日期:',
      status: '状态:',
      countdown: '倒计时:',
      started: '已开始'
    },
    levels: {
      'OG/WA': '奥运会/世界田径锦标赛',
      'DF': '钻石联赛总决赛',
      'DL': '钻石联赛',
      'A': 'A级赛事',
      'B': 'B级赛事',
      'C': 'C级赛事',
      default: '无级别'
    },
    footer: {
      copyright: '© 2025 World Athletics. 保留所有权利。',
      privacyPolicy: '隐私政策',
      termsService: '条款服务'
    }
  },
  athletes: {
    title: '运动员列表',
    addAthlete: '添加运动员',
    searchPlaceholder: '搜索运动员...',
    filter: {
      sport: '项目:',
      country: '国家:',
      gender: '性别:',
      environment: '环境:',
      allCountries: '所有国家',
      allSports: '所有项目',
      allGenders: '所有性别',
      allEnvironments: '所有环境'
    },
    loading: '加载中...',
    error: '获取运动员数据失败',
    noData: '暂无运动员数据',
    retry: '重试',
    confirmDelete: '确定要删除这位运动员吗？',
    saveFailed: '保存失败: ',
    deleteFailed: '删除失败: ',
    pagination: {
      prev: '上一页',
      next: '下一页',
      pageInfo: '第 {current} 页，共 {total} 页'
    },
    details: '查看详情',
    edit: '编辑',
    delete: '删除',
    genders: {
      male: '男',
      female: '女',
      other: '其他'
    }
  },
  events: {
    title: '赛事信息',
    addEvent: '发布赛事',
    searchPlaceholder: '搜索赛事...',
    filter: {
      level: '级别:',
      allLevels: '所有级别',
      sortBy: '排序方式:',
      date: '按日期',
      name: '按名称'
    },
    loading: '加载中...',
    error: '获取赛事数据失败',
    noData: '暂无赛事数据',
    retry: '重试',
    confirmDelete: '确定要删除这项赛事吗？',
    saveFailed: '保存失败: ',
    deleteFailed: '删除失败: ',
    pagination: {
      prev: '上一页',
      next: '下一页',
      pageInfo: '第 {current} 页 / 共 {total} 页'
    },
    details: '查看详情',
    edit: '编辑',
    delete: '删除',
    info: {
      location: '地点:',
      date: '日期:',
      status: '状态:',
      countdown: '倒计时:',
      started: '已开始',
      unknown: '未知',
      tbd: '待定'
    },
    schedule: {
      title: '📅 比赛时间表',
      more: '还有 {count} 个比赛项目...'
    }
  },
  news: {
    title: '新闻资讯',
    addNews: '发布新闻',
    searchPlaceholder: '搜索新闻...',
    filter: {
      category: '分类:',
      allCategories: '所有分类',
      sortBy: '排序方式:',
      date: '按日期',
      popularity: '按热度'
    },
    loading: '加载中...',
    error: '获取新闻数据失败',
    noData: '暂无新闻数据',
    retry: '重试',
    confirmDelete: '确定要删除这条新闻吗？',
    saveFailed: '保存失败: ',
    deleteFailed: '删除失败: ',
    pagination: {
      prev: '上一页',
      next: '下一页',
      pageInfo: '第 {current} 页 / 共 {total} 页'
    },
    edit: '编辑',
    delete: '删除',
    readMore: '阅读更多',
    share: '分享:',
    copyLink: '复制链接',
    shareSuccess: '链接已复制到剪贴板',
    shareTo: {
      wechat: '微信',
      weibo: '微博',
      copy: '复制链接'
    },
    meta: {
      author: '作者',
      date: '日期',
      readTime: '分钟阅读',
      views: '浏览量'
    },
    categories: {
      eventNews: '赛事动态',
      athleteInterview: '运动员专访',
      highlight: '精彩瞬间'
    }
  },
  about: {
    hero: {
      title: '关于世界田径组织',
      subtitle: '推动全球田径运动发展，培养下一代体育英才'
    },
    organization: {
      title: '组织机构',
      subtitle: '致力于田径运动的全球推广与发展',
      stats: {
        members: '成员国',
        athletes: '注册运动员',
        events: '年度赛事',
        history: '历史传承'
      }
    },
    mission: {
      title: '我们的使命',
      description: '通过统一竞赛标准、支持青少年发展、推广科学训练，为全球田径爱好者创造公平竞技的舞台。',
      items: [
        '建立全球统一竞赛规则体系',
        '资助发展中国家的田径项目',
        '推广先进的训练方法和技术',
        '维护体育精神和公平竞争'
      ]
    },
    vision: {
      title: '我们的愿景',
      description: '让田径运动成为连接世界的桥梁，让每个有梦想的人都能在跑道上展现自我。',
      items: [
        '2030年实现全球田径项目覆盖100个国家',
        '每年培养500名优秀青年运动员',
        '建立全球田径数据共享平台',
        '推动田径运动进入更多校园'
      ]
    },
    history: {
      title: '发展历程',
      items: [
        {
          year: '1975',
          title: '组织成立',
          description: '世界田径联合会正式成立，开始统一全球田径竞赛标准'
        },
        {
          year: '1990',
          title: '全球化发展',
          description: '会员国突破100个，开始举办世界青年田径锦标赛'
        },
        {
          year: '2010',
          title: '技术革新',
          description: '引入电子计时和视频回放技术，提升比赛公正性'
        },
        {
          year: '2026',
          title: '数字化时代',
          description: '启动全球数字化平台，实现赛事直播和数据共享'
        }
      ]
    },
    leadership: {
      title: '领导团队',
      members: [
        {
          name: '李明华',
          position: '协会主席',
          bio: '前奥运冠军，曾获1996年亚特兰大奥运会男子110米栏金牌，拥有30年体育管理经验'
        },
        {
          name: '张伟',
          position: '技术总监',
          bio: '北京体育大学体育科学博士，田径技术革新专家，专注于运动科学和训练方法研究'
        },
        {
          name: '王雪',
          position: '赛事主管',
          bio: '国际田联认证赛事组织专家，成功举办多届钻石联赛和世锦赛分站赛'
        }
      ]
    },
    contact: {
      title: '联系我们',
      items: {
        email: '邮箱',
        phone: '电话',
        address: '地址'
      }
    },
    footer: {
      copyright: '© 2026 World Athletics. 保留所有权利。',
      links: {
        privacy: '隐私政策',
        terms: '使用条款',
        contact: '联系我们'
      }
    }
  },
  profile: {
    title: '个人中心',
    subtitle: '管理您的个人信息和收藏',
    sections: {
      personalInfo: '个人信息',
      preferences: '偏好设置',
      favorites: '我的收藏'
    },
    fields: {
      username: '用户名',
      email: '邮箱',
      registrationTime: '注册时间',
      userRole: '用户角色',
      country: '国家/地区',
      admin: '管理员',
      user: '普通用户'
    },
    edit: {
      edit: '编辑',
      save: '保存',
      cancel: '取消',
      saveSuccess: '保存成功！',
      saveFailed: '保存失败: ',
      enterNewUsername: '输入新用户名',
      usernameEmpty: '用户名不能为空',
      usernameSame: '新用户名与当前用户名相同',
      usernameUpdated: '用户名已成功更新！'
    },
    preferences: {
      theme: '主题',
      notifications: '通知',
      eventUpdates: '赛事更新通知',
      newsletter: '新闻简报',
      saveSettings: '保存设置',
      settingsSaved: '偏好设置已保存！',
      settingsFailed: '保存失败，请重试',
      themeOptions: {
        light: '亮色',
        dark: '暗色'
      }
    },
    favorites: {
      loginPrompt: '请先登录查看收藏内容',
      login: '登录',
      empty: '您还没有收藏任何{type}',
      browse: '浏览{type}',
      tabs: {
        athletes: '运动员',
        events: '赛事',
        news: '新闻'
      },
      loading: '加载中...',
      unknownCountry: '未知国家'
    }
  }
}
