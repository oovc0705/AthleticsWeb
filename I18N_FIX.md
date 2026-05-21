# Vercel i18n修复指南

## 问题
Vercel生产环境显示变量名（如`header.home`）而不是翻译文本。

## 原因
vue-i18n alpha版本（v12.0.0-alpha.3）在生产环境不兼容。

## 解决方案

### 核心修改
1. **升级vue-i18n** → v9.13.1（稳定版）
2. **优化i18n初始化** → src/i18n/index.js 添加missingWarn/fallbackWarn配置
3. **添加初始化助手** → src/i18n/setupI18n.js 验证语言包加载
4. **增强持久化** → 语言选择保存到localStorage
5. **Vite构建优化** → 分离打包i18n消息
6. **Vercel配置** → 添加vercel.json和环境变量

### 修改文件列表
```
核心文件：
  ✓ package.json                    (vue-i18n升级)
  ✓ src/i18n/index.js              (初始化优化)
  ✓ src/i18n/setupI18n.js          (NEW)
  ✓ src/main.js                    (添加初始化)
  ✓ src/components/AppHeader.vue   (持久化)
  ✓ vite.config.js                 (构建优化)
  ✓ vercel.json                    (NEW)
  ✓ .env.production                (NEW)
```

## 部署步骤

### 1. 本地验证
```bash
cd vue-project
npm install
npm run build
npm run preview
# 访问 http://localhost:4173 验证
```

### 2. 提交代码
```bash
git add .
git commit -m "fix: 修复Vercel i18n生产环境问题"
git push origin main
```

### 3. Vercel自动部署
- Vercel会自动检测代码更新
- 预计构建时间：2-5分钟
- 部署完成后访问您的Vercel URL验证

## 验证清单

部署后检查：
- [ ] 页面显示中文文本（不是变量名）
- [ ] 语言切换功能正常
- [ ] 刷新页面后语言偏好保留
- [ ] 浏览器控制台无错误

## 故障排除

**仍显示变量名？**
1. 清除Vercel缓存：Vercel Dashboard → Settings → Purge Cache
2. 运行 `node vue-project/verify-i18n-fix.js` 验证本地修复

**构建失败？**
1. 检查Vercel部署日志
2. 确保 `npm run build` 本地成功
3. 确认 package.json 中 vue-i18n 版本无误

## 技术细节

### setupI18n.js 做了什么
- 验证语言包是否正确加载
- 自动检测浏览器语言偏好
- 提供降级机制（默认中文）

### localStorage持久化
```javascript
// 用户切换语言时
localStorage.setItem('language', language.value)

// 应用启动时读取
const savedLanguage = localStorage.getItem('language') || 'zh-CN'
```

### 为什么需要Vite优化
- 将i18n消息单独打包为chunk
- 优化初始加载时间
- 防止包体积警告

## 预期结果

修复后：
✅ Vercel部署成功，无i18n错误  
✅ 页面显示正确的翻译文本  
✅ 语言切换功能正常  
✅ 用户偏好自动保留  

---

修复完成时间：2026年1月8日  
修复状态：✅ 已完成并推送到GitHub  
自动部署：✅ Vercel已开始构建
