# Phase 1 - 基础设施 开发计划

## 1.1 统一错误处理 + 通知系统

### 1.1.1 Toast 通知组件
- [ ] 新建 `src/components/ui/toast.tsx` — 单条 Toast 组件（支持 success / error / warning / info 四种类型）
- [ ] 新建 `src/components/ui/toaster.tsx` — Toast 容器组件，管理多条消息的堆叠和自动消失
- [ ] 新建 `src/hooks/use-toast.ts` — 统一调用接口 `useToast()`，返回 `toast.success()` / `toast.error()` 等
- [ ] 在 `src/app/layout.tsx` 根布局中引入 `<Toaster />`

### 1.1.2 全局错误边界
- [ ] 新建 `src/components/error-boundary.tsx` — React ErrorBoundary 类组件
  - 捕获渲染阶段的错误，展示 fallback UI
  - 包含重试按钮和错误信息

### 1.1.3 AI 层错误统一拦截
- [ ] 修改 `src/lib/ai/index.ts`
  - 为每个 Provider 的 `chat` / `chatStream` 方法加 try-catch
  - 统一抛出结构化错误 `{ code, message, provider }`
  - 处理 401（密钥无效）、429（限流）、网络超时
- [ ] 修改 `src/app/api/chat/send/route.ts`
  - 捕获 AI 调用异常，返回友好错误消息给前端
  - 记录错误日志

---

## 1.2 业务前缀规范

### 当前状态
- `src/lib/db/index.ts` 中已定义 `BUSINESS_PREFIX` 变量和 `TABLES` 映射
- 但 Drizzle schema 中的表名没有应用前缀（`sqliteTable('users', ...)` 就是 `users`）
- `BUSINESS_PREFIX` 默认为 `nomos_`，但方案中应为 `nomos_dev_`（按环境区分）

### 任务
- [ ] 修改 `src/lib/db/index.ts`
  - `BUSINESS_PREFIX` 默认值改为从环境变量 `NOMOS_ENV` 读取：`nomos_dev_` / `nomos_stg_` / `nomos_prod_`
- [ ] 修改 `src/lib/db/schema.ts`
  - 所有 `sqliteTable` 第一个参数改为带前缀的表名，引用 `BUSINESS_PREFIX` 常量
  - 例如：`sqliteTable(`${BUSINESS_PREFIX}users`, { ... })`
  - 需注意：`sqliteTable` 的表名必须是字符串字面量，所以改用 `sqliteTable({ name: `${BUSINESS_PREFIX}users`, ... })` 命名语法
- [ ] 检查并更新 Drizzle 配置文件 `drizzle.config.cjs`（如果有）
- [ ] 生成新的数据库迁移文件 `npm run db:generate`
- [ ] 验证：新建数据库能正确创建带前缀的表

---

## 1.3 版本号 + Git tag 规范

### 1.3.1 版本号常量
- [ ] 新建 `src/constants/version.ts`
  - 导出 `VERSION = "0.1.0"`（与 package.json 同步）
  - 导出 `BUILD_DATE`（构建时注入或开发环境固定值）

### 1.3.2 Header 展示版本号
- [ ] 修改 `src/components/layout/header.tsx`
  - Logo 旁显示小字号版本号，如 `NOMOS v0.1.0`

### 1.3.3 Release 流程
- [ ] 新建 `scripts/release.sh`
  - 接收参数：`minor` / `patch` / `major`
  - 自动更新 `package.json` version 和 `src/constants/version.ts`
  - 提交并打 Git tag `v1.0.1`
  - push 到远程
- [ ] 在 `package.json` scripts 中添加 `"release:patch"` / `"release:minor"` / `"release:major"`

---

## 交付物 checklist

- [x] 表示已完成，[ ] 表示未完成

- [ ] Toast 通知组件
- [ ] ErrorBoundary 组件
- [ ] AI 层错误拦截
- [ ] 业务前缀应用到 schema
- [ ] 数据库迁移
- [ ] 版本号常量
- [ ] Header 显示版本号
- [ ] release 脚本
