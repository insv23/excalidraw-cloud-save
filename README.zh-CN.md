# Excalidraw Cloud Save

自部署 Excalidraw，文件保存在自己部署的服务器中，更方便管理

一个功能完整的自托管 Excalidraw 云端保存应用，集成了 Better Auth 身份验证、SQLite 数据库存储和现代化的侧边栏界面。用户可以创建、编辑、保存和分享绘图，所有数据都存储在您自己的服务器上。

## ✨ 核心功能

### 🎨 Excalidraw 集成
- **完整的 Excalidraw 功能** - 支持所有原生绘图工具和手势
- **实时自动保存** - 2秒延迟自动保存，防止数据丢失
- **手动保存支持** - Ctrl/Cmd+S 快捷键手动保存
- **主题同步** - 支持亮色/暗色主题，与系统设置同步
- **冲突检测** - 多会话编辑冲突检测和提示

### 🔐 完整的身份验证系统
- **邮箱密码认证** - 支持邮箱注册和登录
- **手机号验证** - OTP 验证码登录支持
- **记住我功能** - 持久化登录会话（可配置30天）
- **会话管理** - 安全的令牌存储和跨标签页同步

### 📁 绘图管理功能
- **分类管理** - 最近、置顶、公开、归档、回收站分类
- **搜索功能** - 根据标题快速搜索绘图
- **权限控制** - 私有/公开绘图访问权限管理
- **软删除** - 支持回收站恢复功能
- **批量操作** - 置顶、归档、删除等批量操作

### 🎯 现代化界面
- **统一侧边栏布局** - 绘图列表和画布在同一界面
- **响应式设计** - 移动端友好的界面适配
- **可编辑标题和描述** - 直接点击编辑绘图元信息
- **保存状态指示** - 实时显示保存状态和未保存更改
- **shadcn/ui 组件** - 现代化的 UI 组件库

## 🏗️ 技术架构

### 后端 (`/backend`)

**技术栈：**
- **运行时**: Node.js 18+ 
- **框架**: Hono (轻量级 Web 框架)
- **认证**: Better Auth (现代化认证库)
- **数据库**: Drizzle ORM + SQLite
- **日志**: Consola (美观的控制台日志)
- **构建**: tsup (ESM 格式构建)

**核心特性：**
- RESTful API 设计，支持完整的 CRUD 操作
- 基于角色的访问控制系统
- 绘图元数据和内容分离存储
- 乐观锁定防止编辑冲突
- 自动数据库迁移和模式管理

### 前端 (`/frontend`)

**技术栈：**
- **构建工具**: Vite 6.x
- **框架**: React 19+ with TypeScript
- **路由**: React Router 7.x
- **UI 组件**: shadcn/ui + Radix UI
- **样式**: Tailwind CSS 4.x
- **状态管理**: Zustand + React Hooks
- **绘图引擎**: @excalidraw/excalidraw

**核心特性：**
- 单页应用架构，统一侧边栏布局
- 性能优化的组件渲染（React.memo）
- 客户端数据过滤和分类
- 响应式界面设计
- 暗色/亮色主题支持

## 📁 项目结构

```
excalidraw-cloud-save/
├── backend/                    # 后端 API 服务
│   ├── src/
│   │   ├── db/                # 数据库模式和连接
│   │   │   ├── auth.schema.ts # Better Auth 数据表
│   │   │   ├── drawing.schema.ts # 绘图数据表
│   │   │   └── index.ts       # 数据库连接配置
│   │   ├── lib/               # 工具库和中间件
│   │   │   ├── auth.ts        # Better Auth 配置
│   │   │   ├── drawings.ts    # 绘图业务逻辑
│   │   │   └── env.ts         # 环境变量验证
│   │   ├── routes/            # API 路由定义
│   │   │   ├── drawings.ts    # 绘图元数据 API
│   │   │   └── drawing-content.ts # 绘图内容 API
│   │   ├── types/             # TypeScript 类型定义
│   │   └── index.ts           # 服务器入口点
│   ├── drizzle/               # 数据库迁移文件
│   ├── drizzle.config.ts      # 数据库配置
│   └── package.json
│
├── frontend/                   # React 前端应用
│   ├── src/
│   │   ├── components/        # React 组件
│   │   │   ├── ui/           # shadcn/ui 基础组件
│   │   │   ├── auth/         # 认证相关组件
│   │   │   ├── sidebar/      # 侧边栏组件
│   │   │   └── sidebar-inset/ # 主内容区组件
│   │   ├── pages/            # 页面路由组件
│   │   ├── hooks/            # 自定义 React Hooks
│   │   ├── lib/              # 工具函数和配置
│   │   ├── store/            # Zustand 状态管理
│   │   └── types/            # TypeScript 类型定义
│   └── package.json
│
├── docker-compose.yml          # Docker 部署配置
├── CLAUDE.md                   # AI 助手项目指南
└── README.md                   # 项目文档（本文件）
```

## 🚀 开发指南

### 前置要求

- Node.js (v18 或更高版本)
- npm 包管理器
- SQLite (开发环境自动创建)

### 1. 克隆项目

```bash
git clone <repository-url>
cd excalidraw-cloud-save
```

### 2. 后端设置

```bash
cd backend
npm install

# 初始化数据库
npm run db:push

# 启动开发服务器
npm run dev
```

**后端开发命令：**
```bash
npm run dev              # 启动开发服务器（热重载）
npm run build           # 构建生产版本
npm run start           # 启动生产服务器
npm run db:generate     # 生成数据库迁移文件
npm run db:migrate      # 运行数据库迁移
npm run auth:generate   # 生成 Better Auth 数据表
```

### 3. 前端设置

```bash
cd frontend
npm install

# 启动开发服务器
npm run dev
```

**前端开发命令：**
```bash
npm run dev             # 启动开发服务器
npm run build           # 构建生产版本（包含 TypeScript 编译）
npm run lint            # 运行 ESLint 代码检查
npm run preview         # 预览生产构建
```

### 4. 访问应用

- **前端界面**: http://localhost:5173
- **后端 API**: http://localhost:3000

## 🐳 Docker 生产部署

### 1. 克隆项目

```bash
git clone <repository-url>
cd excalidraw-cloud-save
```

### 2. 配置环境变量

```bash
cp .env.production.example .env.production
```

编辑 `.env.production` 文件，根据实际部署需求调整所有变量值：

```env
# Better Auth 配置
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=https://yourdomain.com
BETTER_AUTH_TRUSTED_ORIGINS=https://yourdomain.com

# CORS 配置
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# 前端 API 配置
VITE_API_BASE_URL=https://yourdomain.com

# 端口配置
FRONTEND_HOST_PORT=80
BACKEND_HOST_PORT=3001

# 其他配置
DISABLE_EMAIL_REGISTRATION=false
VITE_PREVIEW_ALLOWED_HOSTS=yourdomain.com
```

### 3. 启动应用

```bash
# 创建数据目录
mkdir data

# 启动服务
docker compose --env-file .env.production up -d
```

### 4. 完全重新构建（如需要）

```bash
# 停止并删除所有容器和卷
docker compose down -v

# 强制重新构建并启动
docker compose --env-file .env.production up -d --build --force-recreate
```

## 🔌 API 接口文档

### 绘图管理 API

#### `GET /api/drawings`
获取用户的绘图列表，支持分类筛选和分页。

**查询参数：**
- `category`: `"recent"` | `"pinned"` | `"public"` | `"archived"` | `"trash"` (默认: `"recent"`)
- `page`: 页码，最小值 1 (默认: `1`)
- `pageSize`: 每页条数，1-100 (默认: `50`)
- `search`: 标题搜索关键字

#### `POST /api/drawings/:id`
使用前端生成的 UUID 创建新绘图。

#### `GET /api/drawings/:id`
获取绘图元数据，支持智能访问控制。

#### `PATCH /api/drawings/:id`
更新绘图元数据（需要所有权）。

#### `DELETE /api/drawings/:id`
永久删除绘图（需要所有权）。

### 绘图内容 API

#### `GET /api/drawings/:id/content`
获取绘图画布数据。

#### `PUT /api/drawings/:id/content`
保存/更新绘图画布数据，支持乐观锁定。

### 认证 API

- `POST /api/auth/sign-up` - 用户注册
- `POST /api/auth/sign-in` - 用户登录  
- `POST /api/auth/sign-out` - 用户登出
- `GET /api/auth/session` - 获取当前会话

完整的 API 文档请参考 `CLAUDE.md` 文件。

## 🔒 安全特性

- **密码要求**: 最少8个字符，带强度验证
- **会话安全**: 安全令牌生成和验证
- **访问控制**: 基于角色的权限管理
- **输入验证**: 客户端和服务端双重验证
- **CSRF 保护**: Better Auth 内置保护
- **安全头部**: Hono 中间件配置

## 🎨 UI 组件库

应用使用了完整的 shadcn/ui 组件集合：

- **表单组件**: 输入框、邮箱输入、手机输入、密码强度显示
- **布局组件**: 侧边栏、卡片、标签页、分隔符
- **反馈组件**: Toast 通知、加载状态、验证消息
- **交互组件**: 按钮、复选框、下拉菜单
- **导航组件**: 面包屑、菜单项、用户头像

## 🔧 配置和环境变量

### 后端环境变量
- `BETTER_AUTH_SECRET`: 认证密钥
- `BETTER_AUTH_URL`: 应用 URL
- `BETTER_AUTH_TRUSTED_ORIGINS`: 信任的来源
- `CORS_ALLOWED_ORIGINS`: CORS 允许的来源
- `DB_FILE_NAME`: SQLite 数据库文件路径
- `DISABLE_EMAIL_REGISTRATION`: 禁用邮箱注册

### 前端环境变量
- `VITE_API_BASE_URL`: 后端 API 基础 URL

## 📱 设备支持

- **桌面端**: 完整功能支持，最佳用户体验
- **移动端**: 响应式界面，自动收起侧边栏
- **平板端**: 自适应布局，触摸友好

注：由于 Excalidraw 的限制，移动端绘图体验可能不如桌面端流畅。

## 🚦 性能优化

- **组件懒加载**: React.memo 和 key 重新挂载策略
- **数据分离**: 元数据和内容分开加载
- **客户端缓存**: Zustand 状态管理缓存
- **自动保存**: 防抖延迟保存，减少服务器请求
- **乐观更新**: 立即 UI 反馈，后台同步

## 🤝 贡献指南

1. Fork 这个项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)  
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 开源协议

本项目采用 MIT 协议 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Excalidraw](https://excalidraw.com) - 出色的在线绘图工具
- [Better Auth](https://better-auth.com) - 现代化认证库
- [shadcn/ui](https://ui.shadcn.com) - 精美的 UI 组件库
- [Hono](https://hono.dev) - 轻量级 Web 框架
- [Drizzle ORM](https://drizzle.team) - TypeScript ORM
- [Tailwind CSS](https://tailwindcss.com) - 实用优先的 CSS 框架

---

**使用现代化 Web 技术精心构建** ❤️