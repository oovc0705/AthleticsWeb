-- 添加用户国家字段的数据库迁移脚本
-- 执行时间: 2025年1月

-- 1. 检查 country 字段是否存在
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'country';

-- 2. 如果不存在，添加 country 字段
ALTER TABLE users ADD COLUMN country VARCHAR(50);

-- 3. 更新用户 456123@qq.com 的国家为中国
UPDATE users 
SET country = 'CN' 
WHERE email = '456123@qq.com';

-- 4. 验证更新结果
SELECT id, username, email, country, 
       CASE 
         WHEN country = 'CN' THEN '中国'
         WHEN country = 'US' THEN '美国'
         WHEN country = 'JP' THEN '日本'
         ELSE country 
       END as country_name
FROM users 
ORDER BY id;
