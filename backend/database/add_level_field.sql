-- 为赛事表添加级别字段
ALTER TABLE events ADD COLUMN IF NOT EXISTS level VARCHAR(10);

-- 更新现有赛事的级别
UPDATE events SET level = 'OG/WA' WHERE id IN (1, 2);
UPDATE events SET level = 'DF' WHERE id IN (3, 4);
UPDATE events SET level = 'DL' WHERE id IN (5, 6);
UPDATE events SET level = 'A' WHERE id IN (7, 8);
UPDATE events SET level = 'B' WHERE id IN (9, 10);
UPDATE events SET level = 'C' WHERE id IN (11, 12);

-- 为未设置的赛事设置默认级别
UPDATE events SET level = 'A' WHERE level IS NULL;
