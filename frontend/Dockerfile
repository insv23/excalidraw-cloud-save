# 使用 vite preview 托管静态文件
FROM node:20-alpine

WORKDIR /app

# 复制 package.json 并安装依赖
COPY package.json package-lock.json ./
RUN npm ci

# 复制源代码并构建
COPY . .

# 构建参数
ARG VITE_API_BASE_URL
ARG VITE_APP_ENV=production

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_ENV=$VITE_APP_ENV

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 4173

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4173/ || exit 1

# 使用 vite preview 启动，指定端口和host
CMD ["npm", "run", "preview", "--", "--port", "4173", "--host"]
