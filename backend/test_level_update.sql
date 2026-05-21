-- 测试更新赛事等级
UPDATE events SET level = 'DL', status = '计划中' WHERE id = 1;
UPDATE events SET level = 'OG/WA', status = '计划中' WHERE id = 2;
UPDATE events SET level = 'A', status = '计划中' WHERE id = 3;

-- 查看更新结果
SELECT id, name, level, status FROM events ORDER BY id;