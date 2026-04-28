# Phase 3 - 功能补全 开发计划

## 3.1 Timeline 面板（AI + News）

### 当前状态
- `timeline-panel.tsx` 中 AI 和 News 两个 tab 都是占位内容
- schema 中已有 `timeline_ai_events` / `news_items` / `news_sources` 表定义
- `package.json` 已有 `rss-parser` 依赖

### 3.1.1 News 频道
- [ ] 新建 `src/lib/rss/index.ts` — RSS 解析服务
  - 使用 `rss-parser` 拉取 RSS 源
  - 默认配置 5-10 个技术新闻源（Hacker News, TechCrunch 等）
  - 解析结果存入 `news_items` 表
  - 去重（按 title + url）
- [ ] 新建 `src/app/api/news/fetch/route.ts` — 定时拉取 API
  - 从 `news_sources` 读取启用的源
  - 逐个拉取并解析
  - 写入数据库
- [ ] 新建 `src/app/api/news/list/route.ts` — 查询新闻列表 API
  - 按日期范围查询
  - 返回新闻条目
- [ ] 修改 `src/components/layout/timeline-panel.tsx`
  - `<NewsTimeline />` 组件接入新闻列表 API
  - 展示新闻卡片（标题 + 摘要 + 来源 + 时间）
  - 点击跳转到原文链接

### 3.1.2 AI 频道
- [ ] 新建 `src/app/api/timeline/ai/route.ts` — 查询 AI 事件 API
  - 从 `timeline_ai_events` 表读取
  - 按日期排序
- [ ] 修改 `src/components/layout/timeline-panel.tsx`
  - `<AITimeline />` 组件接入 API
  - 展示 AI 事件时间线
  - 事件类型：模型发布、产品更新等
- [ ] 新建 `src/lib/ai-news.ts` — AI 新闻聚合
  - 定时拉取 AI 相关新闻 RSS
  - 写入 `timeline_ai_events` 表

---

## 3.2 Calendar 页面（日历）

### 3.2.1 数据库
- [ ] 在 `src/lib/db/schema.ts` 中新增 `calendar_events` 表
  - `id`, `userId`, `title`, `description`, `startTime`, `endTime`, `color`, `createdAt`, `updatedAt`
  - 导出对应类型
- [ ] 生成并执行数据库迁移

### 3.2.2 日历组件
- [ ] 新建 `src/components/calendar/calendar-view.tsx` — 月视图/周视图切换
  - 使用自建日历网格（避免引入重量级日历库）
  - 月视图：7x5 网格，显示日期和事件点
  - 周视图：7 列，按小时分段
- [ ] 新建 `src/components/calendar/event-card.tsx` — 事件卡片
  - 显示标题、时间、颜色标记
- [ ] 新建 `src/components/calendar/event-dialog.tsx` — 事件创建/编辑弹窗
  - 表单：标题、描述、开始时间、结束时间、颜色

### 3.2.3 API 路由
- [ ] 新建 `src/app/api/calendar/events/route.ts` ��� 事件 CRUD
  - GET — 查询某月/周事件
  - POST — 创建事件
  - PUT — 更新事件
  - DELETE — 删除事件

### 3.2.4 页面
- [ ] 新建 `src/app/(dashboard)/calendar/page.tsx`
  - 全屏日历视图
  - 与 Sidebar 导航联动

---

## 3.3 Settings 页面（设置）

### 3.3.1 页面结构
- [ ] 新建 `src/app/(dashboard)/settings/page.tsx`
  - 使用 Tabs 分四个子区域

### 3.3.2 个人设置
- [ ] 新建 `src/components/settings/profile-settings.tsx`
  - 表单：昵称、头像 URL、邮箱
  - 保存到数据库 `users` 表

### 3.3.3 API 密钥管理
- [ ] 新建 `src/components/settings/api-keys-settings.tsx`
  - Claude API Key / OpenAI API Key / Ollama URL
  - 保存时加密存储到 `ai_configs` 表（使用已有的 `crypto/encrypt`）
  - 显示已保存密钥的掩码（`sk-****xxx`）
  - 测试连接按钮

### 3.3.4 主题设置
- [ ] 新建 `src/components/settings/theme-settings.tsx`
  - Dark / Light 两种主题选项（卡片式选择，带预览）
  - 联动现有 `useSettingsStore.setTheme()`

### 3.3.5 语言设置
- [ ] 新建 `src/components/settings/language-settings.tsx`
  - 中文 / English 选项
  - 联动 `useSettingsStore.setLocale()`

### 3.3.6 API 路由
- [ ] 新建 `src/app/api/settings/profile/route.ts` — 用户资料 CRUD
- [ ] 新建 `src/app/api/settings/api-keys/route.ts` — API 密钥 CRUD

---

## 3.4 搜索功能

### 3.4.1 搜索 API
- [ ] 新建 `src/app/api/search/route.ts`
  - GET 参数 `q`（搜索关键词）
  - 搜索范围：
    - `chat_messages` 表中的内容
    - `calendar_events` 表中的标题/描述
    - `news_items` 表中的标题/摘要
  - SQLite 使用 `LIKE` 全文匹配（轻量方案）
  - 返回分组结果：聊天记录 / 日历事件 / 新闻

### 3.4.2 搜索 UI
- [ ] 新建 `src/components/search/search-panel.tsx`
  - 从 Header 搜索框触发
  - 下拉式搜索结果面板（分 tab 显示）
  - 点击结果跳转到对应内容
- [ ] 修改 `src/components/layout/header.tsx`
  - 搜索框聚焦时显示搜索面板
  - 输入实时搜索（防抖 300ms）

---

## 交付物 checklist

- [ ] News RSS 解析服务
- [ ] News 拉取 API + 列表 API
- [ ] NewsTimeline 组件
- [ ] AI 事件查询 API
- [ ] AITimeline 组件
- [ ] calendar_events 表 + 迁移
- [ ] 日历月视图/周视图组件
- [ ] 事件 CRUD 弹窗
- [ ] 日历事件 API
- [ ] Calendar 页面
- [ ] Settings 页面框架
- [ ] 个人设置组件
- [ ] API 密钥管理组件
- [ ] 主题设置组件
- [ ] 语言设置组件
- [ ] Settings API
- [ ] 全局搜索 API
- [ ] 搜索面板 UI
- [ ] Header 搜索联动
