# Docker 生产部署指南

## 环境要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 最少 1GB 内存
- 最少 2GB 磁盘空间

## 部署步骤

### 1. 环境变量配置

复制并编辑环境变量文件：

```bash
cp .env.production.example .env.production
```

编辑 `.env.production` 文件，设置以下必需变量：

```bash
# Docker 端口映射 (避免常用端口冲突)
BACKEND_HOST_PORT=3001
FRONTEND_HOST_PORT=4173

# 生成一个32位的安全密钥
BETTER_AUTH_SECRET=your-super-secure-secret-key-minimum-32-characters-long

# 设置你的域名
BETTER_AUTH_URL=https://bassapi.example.com
VITE_API_BASE_URL=https://bassapi.example.com

# CORS 和信任域名配置 (只包含前端域名)
BETTER_AUTH_TRUSTED_ORIGINS=https://bass.example.com
CORS_ALLOWED_ORIGINS=https://bass.example.com
```

### 2. 构建和启动

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3. 验证部署

访问应用：
- 前端应用: http://localhost (或你设置的端口)
- 后端健康检查: http://localhost/api/auth/session

检查容器状态：
```bash
# 查看所有容器状态
docker-compose ps

# 查看健康检查状态
docker-compose exec backend wget -qO- http://localhost:3000/
docker-compose exec frontend wget -qO- http://localhost:8080/
```

## 数据管理

### 数据库备份

```bash
# 备份数据库
docker-compose exec backend cp /app/data/production.db /app/data/backup-$(date +%Y%m%d-%H%M%S).db

# 从容器中复制备份文件
docker cp $(docker-compose ps -q backend):/app/data/backup-*.db ./
```

### 数据库恢复

```bash
# 停止服务
docker-compose down

# 恢复数据库文件
docker cp ./backup-file.db $(docker-compose ps -q backend):/app/data/production.db

# 重启服务
docker-compose up -d
```

## 生产优化

### 1. 反向代理 (推荐)

在生产环境中，建议在前面加一层反向代理（如 Nginx 或 Traefik）来处理：
- SSL/TLS 终端
- 域名路由
- 负载均衡

### 2. 监控配置

```bash
# 查看资源使用情况
docker stats

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
```

### 3. 自动重启

服务已配置 `restart: unless-stopped`，会在系统重启后自动启动。

## 故障排除

### 常见问题

1. **容器启动失败**
   ```bash
   # 检查日志
   docker-compose logs backend
   docker-compose logs frontend
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据目录权限
   docker-compose exec backend ls -la /app/data/
   
   # 手动运行迁移
   docker-compose exec backend npm run db:migrate:prod
   ```

3. **前端访问不了后端**
   ```bash
   # 检查网络连接
   docker-compose exec frontend wget -qO- http://backend:3000/
   ```

### 重新部署

```bash
# 完全重新部署
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 清理

```bash
# 停止并移除容器
docker-compose down

# 移除镜像
docker-compose down --rmi all

# 移除数据卷 (注意：会删除数据库数据!)
docker-compose down --volumes
```

## 安全建议

1. 定期更新 Docker 镜像
2. 使用强密码设置 `BETTER_AUTH_SECRET`
3. 在生产环境中使用 HTTPS
4. 定期备份数据库
5. 监控容器资源使用情况
6. 使用防火墙限制访问端口 