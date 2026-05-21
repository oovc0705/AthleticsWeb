const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'webclone',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password'
});

function parseTimestamp(timestamp) {
    if (!timestamp) return new Date();
    if (typeof timestamp === 'string') {
        const parsed = new Date(timestamp);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    if (typeof timestamp === 'number') {
        return new Date(timestamp);
    }
    return new Date();
}

async function migrateUsers() {
    console.log('开始迁移用户数据...');
    try {
        const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8'));
        
        for (const user of usersData) {
            const username = user.username || user.name;
            if (!username) {
                console.warn(`⚠️  跳过用户 ${user.email}：缺少username和name字段`);
                continue;
            }
            
            const createdAt = parseTimestamp(user.createdAt);
            const updatedAt = user.updatedAt ? parseTimestamp(user.updatedAt) : createdAt;
            
            try {
                await pool.query(
                    `INSERT INTO users (username, email, password, role, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     ON CONFLICT (email) DO NOTHING`,
                    [
                        username,
                        user.email,
                        user.password,
                        user.role,
                        createdAt,
                        updatedAt
                    ]
                );
            } catch (error) {
                if (error.code === '23505' && error.constraint === 'users_username_key') {
                    const uniqueUsername = `${username}_${Date.now()}`;
                    console.warn(`⚠️  用户名 ${username} 已存在，使用 ${uniqueUsername} 代替`);
                    await pool.query(
                        `INSERT INTO users (username, email, password, role, created_at, updated_at)
                         VALUES ($1, $2, $3, $4, $5, $6)
                         ON CONFLICT (email) DO NOTHING`,
                        [
                            uniqueUsername,
                            user.email,
                            user.password,
                            user.role,
                            createdAt,
                            updatedAt
                        ]
                    );
                } else {
                    throw error;
                }
            }
        }
        console.log(`✅ 成功迁移 ${usersData.length} 个用户`);
    } catch (error) {
        console.error('❌ 用户数据迁移失败:', error.message);
        throw error;
    }
}

async function migrateNews() {
    console.log('开始迁移新闻数据...');
    try {
        const newsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/news.json'), 'utf8'));
        
        for (const news of newsData) {
            const result = await pool.query(
                `INSERT INTO news (title, content, author, date, category, status, thumbnail, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING id`,
                [
                    news.title,
                    news.content,
                    news.author,
                    news.date,
                    news.category,
                    news.status,
                    news.thumbnail || '',
                    new Date(),
                    new Date()
                ]
            );
            
            const newsId = result.rows[0].id;
            
            if (news.tags && news.tags.length > 0) {
                for (const tag of news.tags) {
                    await pool.query(
                        'INSERT INTO news_tags (news_id, tag) VALUES ($1, $2)',
                        [newsId, tag]
                    );
                }
            }
            
            if (news.comments && news.comments.length > 0) {
                for (const comment of news.comments) {
                    // 使用 user 字段，如果不存在则使用 username 字段
                    const username = comment.user || comment.username;
                    await pool.query(
                        `INSERT INTO news_comments (news_id, username, content, date)
                         VALUES ($1, $2, $3, $4)`,
                        [newsId, username, comment.content, comment.date]
                    );
                }
            }
        }
        console.log(`✅ 成功迁移 ${newsData.length} 条新闻`);
    } catch (error) {
        console.error('❌ 新闻数据迁移失败:', error.message);
        throw error;
    }
}

async function migrateAthletes() {
    console.log('开始迁移运动员数据...');
    try {
        const athletes = [
            { 
                id: 1, 
                name: 'Usain Bolt', 
                sport: 'Sprint',
                country: 'Jamaica',
                age: 36,
                stats: {
                    goldMedals: 8,
                    silverMedals: 1,
                    bronzeMedals: 0,
                    worldRecords: 3,
                    personalBest: '9.58s'
                },
                achievements: [
                    '3x Olympic Gold Medalist',
                    'World Record Holder',
                    'Multiple World Champion'
                ]
            },
            { 
                id: 2, 
                name: 'Shelly-Ann Fraser-Pryce', 
                sport: 'Sprint',
                country: 'Jamaica',
                age: 36,
                stats: {
                    goldMedals: 5,
                    silverMedals: 3,
                    bronzeMedals: 2,
                    worldRecords: 2,
                    personalBest: '10.70s'
                },
                achievements: [
                    '2x Olympic Gold Medalist',
                    'World Champion',
                    'Multiple Diamond League Winner'
                ]
            },
            { 
                id: 3, 
                name: 'Allyson Felix', 
                sport: 'Sprint',
                country: 'USA',
                age: 38,
                stats: {
                    goldMedals: 9,
                    silverMedals: 3,
                    bronzeMedals: 2,
                    worldRecords: 1,
                    personalBest: '21.69s'
                },
                achievements: [
                    '6x Olympic Gold Medalist',
                    'World Champion',
                    'World Record Holder'
                ]
            }
        ];
        
        for (const athlete of athletes) {
            const result = await pool.query(
                `INSERT INTO athletes (id, name, sport, country, age, biography)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (id) DO NOTHING
                 RETURNING id`,
                [athlete.id, athlete.name, athlete.sport, athlete.country, athlete.age, athlete.biography || '']
            );
            
            if (result.rows.length > 0) {
                const athleteId = result.rows[0].id;
                
                await pool.query(
                    `INSERT INTO athlete_stats (athlete_id, gold_medals, silver_medals, bronze_medals, world_records, personal_best)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        athleteId,
                        athlete.stats.goldMedals,
                        athlete.stats.silverMedals,
                        athlete.stats.bronzeMedals,
                        athlete.stats.worldRecords,
                        athlete.stats.personalBest
                    ]
                );
                
                if (athlete.achievements && athlete.achievements.length > 0) {
                    for (const achievement of athlete.achievements) {
                        await pool.query(
                            'INSERT INTO athlete_achievements (athlete_id, achievement) VALUES ($1, $2)',
                            [athleteId, achievement]
                        );
                    }
                }
            }
        }
        console.log(`✅ 成功迁移 ${athletes.length} 个运动员`);
    } catch (error) {
        console.error('❌ 运动员数据迁移失败:', error.message);
        throw error;
    }
}

async function migrateEvents() {
    console.log('开始迁移赛事数据...');
    try {
        const events = [
            {
                id: 1,
                name: '2025年田径世锦赛',
                location: '巴黎',
                date: '2025-08-22',
                endDate: '2025-08-30',
                type: '田径',
                level: 'OG/WA',
                status: '已完成',
                description: '第19届世界田径锦标赛，是世界上最高水平的田径赛事之一。',
                organizer: '国际田径联合会'
            },
            {
                id: 2,
                name: '2026年全国田径锦标赛',
                location: '北京',
                date: '2026-05-15',
                endDate: '2026-05-22',
                type: '田径',
                level: 'A',
                status: '计划中',
                description: '2026年全国田径锦标赛，是国内最高水平的田径赛事。',
                organizer: '中国田径协会'
            },
            {
                id: 3,
                name: '2025年钻石联赛上海站',
                location: '上海',
                date: '2025-09-15',
                endDate: '2025-09-15',
                type: '田径',
                level: 'DL',
                status: '已完成',
                description: '2025年国际田联钻石联赛上海站比赛。',
                organizer: '国际田径联合会'
            }
        ];
        
        for (const event of events) {
            await pool.query(
                `INSERT INTO events (id, name, location, date, end_date, type, level, status, description, organizer)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 ON CONFLICT (id) DO NOTHING`,
                [
                    event.id,
                    event.name,
                    event.location,
                    event.date,
                    event.endDate,
                    event.type,
                    event.level,
                    event.status,
                    event.description,
                    event.organizer
                ]
            );
        }
        console.log(`✅ 成功迁移 ${events.length} 个赛事`);
    } catch (error) {
        console.error('❌ 赛事数据迁移失败:', error.message);
        throw error;
    }
}

async function main() {
    try {
        console.log('🚀 开始数据迁移到PostgreSQL数据库...');
        console.log(`📊 数据库: ${process.env.DB_NAME || 'webclone'}`);
        console.log('');
        
        await migrateUsers();
        await migrateNews();
        await migrateAthletes();
        await migrateEvents();
        
        console.log('');
        console.log('🎉 数据迁移完成！');
        
        await pool.end();
    } catch (error) {
        console.error('💥 迁移过程中发生错误:', error);
        await pool.end();
        process.exit(1);
    }
}

main();