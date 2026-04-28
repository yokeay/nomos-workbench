# NOMOS AI Workbench

## 项目简介

NOMOS AI Workbench 是一个 AI 驱动的工作台，集成聊天、终端和时间线功能。

### 技术栈
- **框架**: Next.js 16.x + React 19
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui
- **数据库**: Drizzle ORM + SQLite/PostgreSQL
- **认证**: NextAuth.js
- **实时功能**: WebSocket
- **部署**: Docker

## 快速开始

### 环境要求

- Node.js >= 20
- pnpm >= 8 (推荐)

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 配置环境变量

复制 `.env.example` 为 `.env.development` 并修改相应配置：

```bash
cp .env.example .env.development
```

关键配置项：
- `BUSINESS_PREFIX`: 业务前缀，用于区分不同业务的数据
- `DATABASE_URL`: 数据库连接字符串
- `NEXTAUTH_SECRET`: 认证密钥（生产环境务必修改）
- `ENCRYPTION_KEY`: 加密密钥（32字节hex = 64字符）

### 启动开发服务器

```bash
# 开发环境
npm run dev

# 指定端口
PORT=5000 npm run dev
```

访问 http://localhost:5000

### 生产环境

```bash
# 构建
npm run build:production

# 启动
npm start
```

## 配置说明

### 业务前缀配置

所有数据库表名、Redis 键等都会自动加上业务前缀前缀。不同环境的业务前缀：

| 环境 | 业务前缀 |
|------|----------|
| Development | `nomos_dev_` |
| Staging | `nomos_stg_` |
| Production | `nomos_prod_` |

**注意**: 业务前缀必须唯一，不要重复使用。

### 数据库迁移

```bash
# 生成迁移文件
npm run db:generate

# 执行迁移
npm run db:migrate
```

### 代码规范

- **Lint**: `npm run lint`
- **Format**: `npm run format`
- **Type Check**: `npm run type-check`

### Git 分支策略

```
main       - 生产分支
dev        - 开发分支
feat/*     - 功能开发分支
```

### Commit 规范

遵循 Conventional Commits：

- `feat:` - 新功能
- `fix:` - Bug修复
- `docs:` - 文档更新
- `style:` - 代码格式
- `refactor:` - 重构
- `test:` - 测试相关
- `chore:` - 构建/工具

示例：
```bash
git commit -m "feat: 添加 TOTP 双因素认证"
git commit -m "fix: 修复 Token 刷新逻辑"
```

### Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

## 功能模块

### 1. AI Chat
- 支持 Claude、OpenAI 等模型
- 会话管理
- 流式响应

### 2. Terminal
- 集成 WebSocket
- 支持远程终端访问

### 3. Timeline
- AI 事件追踪
- 新闻流展示

## 安全规范

1. **密钥管理**: 所有密钥必须在 `.env` 文件中配置
2. **HTTPS**: 生产环境强制 HTTPS
3. **认证**: 所有 API 接口必须认证
4. **输入校验**: 所有用户输入必须校验和转义
5. **TOTP 加密**: TOTP 密钥必须加密存储

## 环境变量配置

### .env.development (开发环境)

```env
BUSINESS_PREFIX=nomos_dev_
ENVIRONMENT=development
DATABASE_URL=file:./data/workbench.db
PORT=5000
NEXTAUTH_URL=http://localhost:5000
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
NEXT_PUBLIC_TERMINAL_WS_URL=ws://localhost:8080
OLLAMA_BASE_URL=http://localhost:11434
ENABLE_BACKUP=false
LOG_LEVEL=debug
```

### .env.staging (预发布环境)

```env
BUSINESS_PREFIX=nomos_stg_
ENVIRONMENT=staging
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=5000
NEXTAUTH_URL=https://staging.example.com
ENCRYPTION_KEY=staging-32-char-key
ENABLE_BACKUP=true
LOG_LEVEL=info
```

### .env.production (生产环境)

```env
BUSINESS_PREFIX=nomos_prod_
ENVIRONMENT=production
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=5000
NEXTAUTH_URL=https://workbench.example.com
ENCRYPTION_KEY=prod-32-char-key-change
ENABLE_BACKUP=true
REDIS_URL=redis://redis:6379
S3_ENDPOINT=https://s3.example.com
S3_BUCKET=nomos-backups
LOG_LEVEL=warn
```

## 更新日志

请查看 [maintain.md](./maintain.md) 了解版本迭代历史。

## 测试

```bash
# 运行测试
npm run test

# UI 模式运行测试
npm run test:ui

# 覆盖率报告
npm run test:coverage
```

## 许可证

MIT
