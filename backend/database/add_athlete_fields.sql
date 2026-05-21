-- 为运动员表添加性别和环境字段

-- 添加性别字段
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('男', '女'));

-- 添加环境字段
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS environment VARCHAR(10) CHECK (environment IN ('室内', '室外'));

-- 为新字段创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_athletes_gender ON athletes(gender);
CREATE INDEX IF NOT EXISTS idx_athletes_environment ON athletes(environment);
