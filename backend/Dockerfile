# 使用官方Node.js镜像作为基础镜像
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装生产依赖（基于 lockfile 确定性安装）
RUN npm ci --omit=dev

# 复制应用代码
COPY . .

# 日志目录归属非 root 用户（server 会向该目录追加访问/错误日志）
RUN mkdir -p /app/logs && chown -R node:node /app/logs

# 暴露端口（与 README 默认端口 3006 一致）
EXPOSE 3006

# 设置环境变量（PORT 可被 docker-compose 覆盖）
ENV NODE_ENV=production
ENV PORT=3006

# 以非 root 用户运行
USER node

# 启动命令
CMD ["npm", "start"]
