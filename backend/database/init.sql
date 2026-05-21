-- d:\world_athletics_clone\backend\database\init.sql
-- 数据库初始化脚本

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建运动员表
CREATE TABLE IF NOT EXISTS athletes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sport VARCHAR(50),
    country VARCHAR(50),
    age INTEGER,
    biography TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建运动员统计表
CREATE TABLE IF NOT EXISTS athlete_stats (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER UNIQUE REFERENCES athletes(id) ON DELETE CASCADE,
    gold_medals INTEGER DEFAULT 0,
    silver_medals INTEGER DEFAULT 0,
    bronze_medals INTEGER DEFAULT 0,
    world_records INTEGER DEFAULT 0,
    personal_best VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建运动员成就表
CREATE TABLE IF NOT EXISTS athlete_achievements (
    id SERIAL PRIMARY KEY,
    athlete_id INTEGER REFERENCES athletes(id) ON DELETE CASCADE,
    achievement TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建赛事表
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(100),
    date DATE,
    end_date DATE,
    type VARCHAR(50),
    level VARCHAR(10),
    status VARCHAR(20),
    description TEXT,
    organizer VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建赛事评论表
CREATE TABLE IF NOT EXISTS event_comments (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建新闻表
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    author VARCHAR(100),
    date DATE,
    category VARCHAR(50),
    status VARCHAR(20),
    thumbnail TEXT,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建新闻标签表
CREATE TABLE IF NOT EXISTS news_tags (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
    tag VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建新闻评论表
CREATE TABLE IF NOT EXISTS news_comments (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES news_comments(id) ON DELETE CASCADE,
    content TEXT,
    date DATE,
    reply_to_username VARCHAR(50),
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建新闻评论点赞表
CREATE TABLE IF NOT EXISTS news_comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES news_comments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) CHECK (type IN ('like', 'dislike')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id)
);

-- 创建收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(20),
    item_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_type, item_id)
);

-- 创建比赛项目表
CREATE TABLE IF NOT EXISTS event_schedules (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    event_name VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    venue VARCHAR(100),
    status VARCHAR(20) DEFAULT '未开始',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建比赛结果表
CREATE TABLE IF NOT EXISTS event_results (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES event_schedules(id) ON DELETE CASCADE,
    athlete_name VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    rank INTEGER,
    score VARCHAR(50),
    result_detail TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_athletes_updated_at ON athletes;
CREATE TRIGGER update_athletes_updated_at BEFORE UPDATE ON athletes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_athlete_stats_updated_at ON athlete_stats;
CREATE TRIGGER update_athlete_stats_updated_at BEFORE UPDATE ON athlete_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_schedules_updated_at ON event_schedules;
CREATE TRIGGER update_event_schedules_updated_at BEFORE UPDATE ON event_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_results_updated_at ON event_results;
CREATE TRIGGER update_event_results_updated_at BEFORE UPDATE ON event_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_updated_at ON news;
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_athletes_country ON athletes(country);
CREATE INDEX IF NOT EXISTS idx_athletes_sport ON athletes(sport);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_tags_tag ON news_tags(tag);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_event_schedules_event_id ON event_schedules(event_id);
CREATE INDEX IF NOT EXISTS idx_event_schedules_date ON event_schedules(event_date);
CREATE INDEX IF NOT EXISTS idx_event_schedules_status ON event_schedules(status);
CREATE INDEX IF NOT EXISTS idx_event_results_schedule_id ON event_results(schedule_id);