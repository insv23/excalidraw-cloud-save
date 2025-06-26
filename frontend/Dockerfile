# 使用 vite preview 托管静态文件
FROM node:20-alpine

WORKDIR /app

# 复制 package.json 并安装依赖
COPY package.json package-lock.json ./
RUN npm ci

# 复制源代码
COPY . .

# 构建参数 - 只包含构建时需要的变量
ARG VITE_API_BASE_URL

# 设置环境变量供构建使用
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 构建应用（会读取上面的环境变量）
RUN npm run build

# 暴露端口
EXPOSE 4173

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4173/ || exit 1

# 使用 vite preview 启动（也会读取 VITE_PREVIEW_ALLOWED_HOSTS）
CMD ["npm", "run", "preview", "--", "--port", "4173", "--host"]
