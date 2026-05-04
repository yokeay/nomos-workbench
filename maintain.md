# NOMOS Workbench - 版本迭代记录

## v0.1.1 - 2026-05-04

### 变更内容
- 完整前端 UI 重新设计，采用 macOS / Apple 极简美学风格
- 全局 CSS 变量重构：暖灰 light mode + 冷极黑 dark mode（HSL 色彩体系）
- Glass morphism（毛玻璃）效果：sidebar / header / dropdown / sheet
- 多层软阴影系统（shadow-subtle / sm-soft / md-soft / lg-soft / xl-soft / glass）
- Spring 缓动曲线（ease-spring）和流畅过渡动画
- lucide-react 图标替换所有 emoji 文本图标
- 组件圆角统一：rounded-xl / rounded-2xl

### 影响范围
- 全局样式：globals.css / tailwind.config.ts
- 布局组件：Header / Sidebar / TimelinePanel
- 功能组件：ChatContainer / ChatMessages / MessageBubble / ModelSelector / TerminalCard
- 页面：Dashboard / Calendar / Settings
- UI 基元组件 16 个：Button / Card / Input / Tabs / Dialog / Select / DropdownMenu / Badge / Avatar / Sheet / Separator / ScrollArea / Skeleton / Tooltip / Toast / Toaster

### 技术变更
- Tailwind CSS 3.4 扩展色板（glass / sidebar / success / warning / input-background）
- CSS 自定义属性（backdrop-filter blur / 多层 box-shadow）
- 动画关键帧（fade-in / slide-up / scale-in / slide-in-from-top）

---

## v1.0.0 - 初始版本
**发布日期**: 2025-04-27
- 项目初始化和基础架构搭建
- AI Chat / Terminal / TimelinePanel 功能
- Drizzle ORM + Docker 容器化
