# NOMOS Workbench - 版本迭代记录

## v0.2.6 - 2026-05-07

### 变更内容
- **新闻渠道过滤**：设置页面新增「新闻渠道」卡片，支持按技术/国内/财经/国际/其他分组多选过滤，持久化到 localStorage
- **Memos 骨架屏修正**：loading.tsx 更新为两栏布局（左 w-[334px] + 右 flex-1），与实际页面结构匹配
- **笔记抽屉内编辑**：笔记详情抽屉新增编辑模式，支持修改 Markdown 内容并通过 PUT /api/memos/[id] 保存
- **抽屉位置修正**：MemoDetailDrawer 从 fixed 定位改为 absolute，仅覆盖右侧面板不覆盖新闻时间线
- **Todo 待办功能**：Memos 日历下方新增 Todo 应用，支持创建/编辑/查看/删除待办、勾选完成/未完成、拖拽排序
  - 数据库新增 `nomos_dev_todos` 表
  - 新增 API：GET/POST /api/todos, PUT/DELETE /api/todos/[id], PUT /api/todos/reorder
  - 统计卡片（全部/已完成/未完成）+ 过滤标签 + 拖拽排序（@dnd-kit）

### 修改/新增文件
- `src/stores/news-filter.ts` — 新建，新闻渠道过滤 zustand store
- `src/app/(dashboard)/settings/page.tsx` — 新增 NewsFilterManager 组件
- `src/components/layout/timeline-panel.tsx` — addToCache 加入新闻源过滤
- `src/i18n/config.ts` — 新增 settings.newsFilter / todo / memos 翻译 key
- `src/app/(dashboard)/memos/loading.tsx` — 重写为两栏骨架屏
- `src/components/memos/memo-detail-drawer.tsx` — 新增编辑模式 + 定位改为 absolute
- `src/app/api/memos/[id]/route.ts` — 新增 PUT handler
- `src/app/(dashboard)/memos/page.tsx` — 集成 TodoView + onUpdate 回调 + 右面板 relative
- `src/lib/db/schema.ts` — 新增 todos 表定义
- `src/lib/db/index.ts` — 注册 todos 表
- `src/components/memos/todo-view.tsx` — 新建，Todo 主组件
- `src/components/memos/todo-dialog.tsx` — 新建，Todo 创建/编辑/查看对话框
- `src/app/api/todos/route.ts` — 新建，GET/POST 待办列表
- `src/app/api/todos/[id]/route.ts` — 新建，PUT/DELETE 单个待办
- `src/app/api/todos/reorder/route.ts` — 新建，PUT 批量排序
- **终端独立页面**：终端从聊天页 overlay 改为 `/terminal` 独立路由，暗色系统监控面板风格
  - 系统信息面板（主机名/IP/OS/CPU/内存/磁盘/网络IO/进程/负载/运行时间）
  - 资源趋势 sparkline + 进度条展示
  - 底部 xterm 终端交互区（复用 gotty WebSocket）
- **Memos Tab 联动修复**：右面板始终渲染编辑器+时间线，非笔记 tab 不再显示占位文字；首个 tab 标签改为「代办」
- **历史上的今天缓存**：新增 `nomos_dev_history_onthisday` 表，首次请求 Wikipedia API 后缓存，后续从 DB 读取
- **万年历缓存**：新增 `nomos_dev_almanac` 表，首次计算农历后缓存，后续从 DB 读取
- `src/app/(dashboard)/terminal/page.tsx` — 新建，终端页面主组件
- `src/components/terminal/sys-info-panel.tsx` — 新建，系统信息+资源监控面板
- `src/components/terminal/terminal-panel.tsx` — 新建，xterm 终端面板
- `src/components/layout/sidebar.tsx` — Terminal 按钮改为路由跳转
- `src/app/api/history/today/route.ts` — 新增 DB 缓存逻辑
- `src/app/api/almanac/today/route.ts` — 新增 DB 缓存逻辑
- `src/components/memos/tab-bar.tsx` — 标签改名「代办」
- `drizzle/0003_adorable_stone_men.sql` — 迁移文件（history_onthisday + almanac 表）

---

## v0.2.5 - 2026-05-06

### 变更内容
- **终端 WebSocket URL 配置**：设置页面新增「终端」配置卡片，用户可自定义 gotty WebSocket 地址
- **TerminalManager 组件**：设置页面新增终端配置卡片，保存到 localStorage（key: `nomos_terminal_ws_url`）
- **终端组件适配**：terminal-card 读取逻辑改为 localStorage 优先 → 环境变量 → 默认值

### 修改文件
- `src/app/(dashboard)/settings/page.tsx` — 新增 TerminalManager 组件
- `src/components/terminal/terminal-card.tsx` — localStorage 读取 WS URL
- `src/i18n/config.ts` — 新增 terminal 相关翻译 key（zh/en）

---

## v0.2.4 - 2026-05-06

### 变更内容
- **登录系统**：NextAuth v5 GitHub OAuth + 账号密码双登录方式，管理员仅限 GitHub 登录
- **头像迁移**：用户头像从 Header 右上角迁移到 Sidebar 左下角，弹窗右侧展开
- **操作保护**：Memos 编辑器/Settings 保存/API 写入操作增加登录门控，未登录禁止操作
- **Toast 居中**：所有 toast 提示从右上角移到顶部居中位置
- **DUFS 图片代理**：新增 `/api/storage/raw/[...path]` 代理端点，解决 DUFS HTTP Basic Auth 导致浏览器 `<img>` 403 问题
- **Markdown 渲染**：Memos 时间线和详情抽屉使用 react-markdown + remark-gfm 渲染
- **Memos 数据修复**：修复前端 data.items → data 解析错误，笔记正确展示
- **DB 表修复**：创建缺失的 `nomos_dev_storage_config` 表，修复存储配置保存失败
- **设置页面滚动条隐藏**：overflow-auto → overflow-auto no-scrollbar

### 数据库变更
- `nomos_dev_users` 表：新增 `role` TEXT NOT NULL DEFAULT 'user'、`github_id` TEXT 字段
- `nomos_dev_storage_config` 表：手动创建（Drizzle schema 已定义但迁移未执行）

### 新增文件
- `src/types/next-auth.d.ts` — NextAuth 类型扩充（Session/User/JWT role）
- `src/app/login/page.tsx` — 登录页面（GitHub + Credentials 双 Tab）
- `src/hooks/use-auth.ts` — 便捷 auth hook
- `src/app/api/storage/raw/[...path]/route.ts` — DUFS 图片代理端点
- `scripts/migrate-users-roles.ts` — 数据库迁移脚本

### 修改文件
- `src/lib/db/schema.ts` — users 表新增 role/githubId
- `src/lib/auth/index.ts` — 新增 GitHub provider、signIn callback、管理员拦截
- `src/app/(dashboard)/layout.tsx` — SessionProvider 包裹
- `src/components/layout/sidebar.tsx` — 左下角头像 + 登录/退出
- `src/components/layout/header.tsx` — 删除右侧头像
- `src/components/ui/toaster.tsx` — Toast 居中
- `src/components/memos/memos-timeline.tsx` — Markdown 渲染 + urlTransform
- `src/components/memos/memo-detail-drawer.tsx` — Markdown 渲染 + urlTransform
- `src/app/(dashboard)/settings/page.tsx` — 登录门控 + scrollbar 隐藏
- `src/i18n/config.ts` — 新增 login namespace
- `tailwind.config.ts` — 新增 @tailwindcss/typography 插件
- `.env.example` — 新增 GitHub OAuth + ADMIN_EMAILS

---

## v0.2.3 - 2026-05-06

### 变更内容
- **文件存储适配器**：新增 S3 和 DUFS 存储后端支持，默认使用本地存储
- **存储配置页面**：设置页面新增「文件存储」配置卡片，支持三种存储方式切换
- **Storage Adapter 模式**：统一 `StorageAdapter` 接口，本地/S3/DUFS 三种实现
- **DB 类型修复**：修复 Drizzle ORM `never` 类型推断问题（53 个 TS 错误全部消除）
- **Turbopack 配置**：添加 `turbopack: {}` 配置兼容 Next.js 16 默认 Turbopack 构建

### 新增文件
- `src/lib/storage/types.ts` — StorageAdapter 接口 + 各 Provider Config 类型
- `src/lib/storage/adapters/local.ts` — 本地文件系统适配器
- `src/lib/storage/adapters/s3.ts` — S3 适配器（@aws-sdk/client-s3）
- `src/lib/storage/adapters/dufs.ts` — DUFS 适配器（HTTP PUT）
- `src/lib/storage/index.ts` — getStorageAdapter() 工厂函数
- `src/app/api/settings/storage/route.ts` — Storage 配置 CRUD API

### 修改文件
- `src/lib/db/schema.ts` — 新增 storage_config 表
- `src/lib/db/index.ts` — 注册 storageConfig + 修复类型推断
- `src/app/api/memos/upload/route.ts` — 使用 storage adapter 替代直接写文件
- `src/app/(dashboard)/settings/page.tsx` — 新增 StorageManager 组件
- `src/i18n/config.ts` — 新增存储相关翻译 key
- `next.config.ts` — 添加 turbopack 配置 + $client 修复
- `package.json` — 新增 @aws-sdk/client-s3 依赖 + 版本号 0.2.3

### 影响范围
- Memos 文件上传向后兼容，默认本地存储行为不变
- 设置页面可切换 S3/DUFS 存储，配置保存后即时生效
- SecretKey 在 GET 时脱敏返回，PUT 时保留旧值防止意外覆盖

---

## v0.2.2 - 2026-05-06

### 变更内容
- **万年历 enrich**：用 `lunar-typescript` npm 包替换 `lunar`，丰富农历数据显示
- **八字五行**：显示年/月/日/时四柱八字 + 五行 + 纳音
- **宜忌**：宜/忌事项以标签样式展示
- **冲煞/吉神/凶神**：显示当日冲煞方向、吉神凶神列表
- **胎神/彭祖百忌**：显示胎神方位和彭祖百忌
- **值日星宿**：显示二十八星宿 + 吉凶标识 + 星宿歌诀

### 修改文件
- `src/app/api/almanac/today/route.ts` — 从 `lunar` 切换到 `lunar-typescript`，返回完整农历元数据
- `src/components/memos/almanac-display.tsx` — 完整重写，展示所有丰富农历信息
- `package.json` — 新增 `lunar-typescript` 依赖

### 影响范围
- 万年历展示内容大幅增加，需要滚动查看
- API 返回字段扩展，向下兼容（仅新增字段）

---

## v0.2.1 - 2026-05-06

### 变更内容
- **新闻时间线持久化**：已展示的新闻条目位置通过 localStorage 持久化，刷新页面不再重置打字机动画
- **打字机动画优化**：已通过 localStorage 恢复的条目直接显示全文（`instant` 模式），未展示的新条目仍走动画

### 修改文件
- `src/components/layout/timeline-panel.tsx` — 新增 localStorage 持久化逻辑（saveState/restoreState/restoreRevealed）

### 影响范围
- 新闻时间线刷新体验：已展示位置不会丢失，继续从上次位置"压账"推进

---

## v0.2.0 - 2026-05-06

### 变更内容
- **Memos 笔记系统**：新增 /memos 页面，包含小型日历 + 3Tab切换栏 + Markdown编辑器 + 笔记时间线
- **Markdown 编辑器**：支持剪贴板粘贴图片自动上传、拖放文件上传、Ctrl+Enter 快捷发布
- **笔记时间线**：左侧竖线时间轴样式，显示所有已发布笔记，点击打开详情抽屉
- **详情抽屉**：从右侧滑入的抽屉，支持查看笔记全文和删除操作
- **历史上的今天**：集成 Wikipedia REST API，展示精选/事件/诞辰/忌日
- **万年历**：集成 `lunar` npm 包，展示农历日期、生肖年、节气信息
- **侧边栏 Memos 入口**：新增 StickyNote 图标入口，支持 toggle 行为
- **数据库**：新增 `memos` + `memo_attachments` 表
- **API 端点**：/api/memos (GET/POST)、/api/memos/[id] (GET/DELETE)、/api/memos/upload (POST)、/api/history/today (GET)、/api/almanac/today (GET)

### 新增文件
- `src/components/memos/small-calendar.tsx` — 小型月历组件
- `src/components/memos/tab-bar.tsx` — 3Tab切换栏（笔记/历史上今天/万年历）
- `src/components/memos/memos-editor.tsx` — Markdown编辑器（粘贴/拖放/上传）
- `src/components/memos/memos-timeline.tsx` — 笔记时间线（竖线时间轴）
- `src/components/memos/memo-detail-drawer.tsx` — 笔记详情抽屉（右侧滑入）
- `src/components/memos/history-display.tsx` — 历史上的今天展示
- `src/components/memos/almanac-display.tsx` — 万年历展示
- `src/app/(dashboard)/memos/page.tsx` — Memos 主页面
- `src/app/(dashboard)/memos/loading.tsx` — Memos 加载骨架屏
- `src/app/api/memos/route.ts` — 笔记 CRUD 列表
- `src/app/api/memos/[id]/route.ts` — 笔记单条 CRUD
- `src/app/api/memos/upload/route.ts` — 文件上传
- `src/app/api/history/today/route.ts` — 历史上的今天 API
- `src/app/api/almanac/today/route.ts` — 农历转换 API

### 修改文件
- `src/components/layout/sidebar.tsx` — 新增 Memos 侧边栏入口
- `src/lib/db/schema.ts` — 新增 memos + memoAttachments 表
- `src/lib/db/index.ts` — 注册 memos/memoAttachments 到 TABLES map

### 影响范围
- 侧边栏新增 Memos 导航入口
- 数据库新增两张表（memos + memo_attachments）
- 文件上传存储于 public/uploads/memos/

---

## v0.1.9 - 2026-05-06

### 变更内容
- **鼠标滚轮翻页修复**：handleWheel 新增 deltaY 处理，普通鼠标滚轮上下滚动可正常翻页
- **侧边栏按钮统一切换**：所有导航按钮（标签网格/日历/设置）统一为 toggle 行为，首次点击进入视图，已在视图时再次点击返回上一页
- **骨架屏加载状态**：为 /tags、/calendar、/settings 路由添加 loading.tsx 骨架屏，路由切换时展示加载占位

### 修改文件
- `src/components/tag-grid/tag-grid-view.tsx` — handleWheel 新增 deltaY 处理 + e.preventDefault()
- `src/components/layout/sidebar.tsx` — 统一所有导航按钮为切换行为，移除 Link 导入

### 新增文件
- `src/app/(dashboard)/tags/loading.tsx` — 标签网格骨架屏
- `src/app/(dashboard)/calendar/loading.tsx` — 日历骨架屏
- `src/app/(dashboard)/settings/loading.tsx` — 设置骨架屏

### 影响范围
- 侧边栏所有按钮行为变更为 toggle，点击已在的视图会返回上一页
- 路由切换时展示骨架屏加载状态，提升感知性能

---

## v0.1.8 - 2026-05-06

### 变更内容
- **标签网格样式重构**：网格左对齐水平填充，每页 4 行垂直居中，自适应列数
- **「全部」tab**：一级/二级分类首位新增「全部」默认选中
- **页码指示器**：实心圆（当前页）+ 空心圆（其他页），点击跳转
- **侧边栏切换**：标签网格按钮点击一次进入，已在页面时再点击返回上一页
- **鼠标滚轮翻页**：鼠标横向滚轮（触控板左右滑动）自动切换上/下一页

### 修改文件
- `src/components/tag-grid/tag-grid-view.tsx` — 完整重写布局 + 分页逻辑 + 全部tab
- `src/components/layout/sidebar.tsx` — 标签按钮 toggle 行为（push / back）

### 影响范围
- 标签网格交互方式变更
- 侧边栏标签按钮不再是纯 Link，改为 toggle 按钮

---

## v0.1.7 - 2026-05-06

### 变更内容
- **标签网格功能**：侧边栏新增「标签网格」入口，点击进入 macOS Launchpad 风格的标签浏览视图
- **二级分类导航**：顶部一级大类 tab + 二级分类 tab，切换即时更新下方标签网格
- **翻页网格**：标签以图标+名称卡片形式展示，每页 20 个，左右箭头翻页，底部圆点指示器
- **Mock 数据**：5 个一级分类（开发工具/数据存储/AI工具/设计资源/效率工具），15 个二级分类，90+ 标签

### 新增文件
- `src/lib/tag-grid/types.ts` — 标签网格数据类型（Category / SubCategory / TagItem）
- `src/lib/tag-grid/mock-data.ts` — 完整 Mock 数据集
- `src/components/tag-grid/tag-grid-view.tsx` — 标签网格主视图组件
- `src/app/(dashboard)/tags/page.tsx` — /tags 路由页面

### 修改文件
- `src/components/layout/sidebar.tsx` — 首个导航项从「仪表盘」改为「标签网格」，路由改为 /tags
- `src/i18n/config.ts` — sidebar:dashboard → sidebar:tags（中英文）

### 影响范围
- 侧边栏导航变更，默认视图从聊天改为标签网格
- /dashboard 路由（AI 聊天）仍然可通过终端按钮访问

---

## v0.1.6 - 2026-05-06

### 变更内容
- **天气组件**：Header 右侧新增 WeatherWidget，展示地理位置（城市名） + 当前天气温度 + 天气图标
- **天气弹窗**：点击天气组件弹出 7 天预报卡片（当天 + 6 天），含天气图标、温度范围、降水量
- **天气数据**：通过 MSN Location API 获取 IP 定位，MSN Weather API 获取天气（Next.js API Route 代理，10min ISR 缓存）
- **日期时间重构**：改为双行结构 —— 上排"2026年5月6日"，下排"周四 14:30:25"（每秒实时刷新）
- **搜索框加宽**：默认宽度 w-48，激活宽度 w-80

### 新增文件
- `src/components/weather/weather-widget.tsx` — 天气组件（定位获取 + 天气展示 + 7天弹窗）
- `src/app/api/weather/route.ts` — 天气 API 代理端点

### 修改文件
- `src/components/layout/header.tsx` — 日期时间重构 + 天气组件集成 + 搜索框加宽

### 影响范围
- Header 右侧区域布局变更
- 新增 /api/weather 端点

---

## v0.1.5 - 2026-05-06

### 变更内容
- **新闻优先级排序**：添加 sourcePriority 字段，排序规则：科技(0-1) > 国内(2) > 财经(3) > 国际(4)，同优先级按时间倒序
- **启用 LINUX DO**：移除 `disable: true`，API 正常可用（HTTP 200），设为最高优先级 0
- **LinuxDo 抓取器**：`linuxdo-hot` (daily.json) 和 `linuxdo-latest` (latest.json) 两个子源

### 修改文件
- `src/lib/newsnow/types.ts` — SourceDefinition 新增 `priority` 字段，TimelineItem 新增 `sourcePriority` 字段
- `src/lib/newsnow/sources.ts` — 所有源分配 priority（0-4），LinuxDo 启用并设为 priority 0
- `src/lib/newsnow/scheduler.ts` — fetchAndBroadcast/buildSnapshot 添加 sourcePriority + 优先级排序
- `src/app/api/news/timeline/route.ts` — mapSourceItems 传递 sourcePriority + 全局优先级排序
- `src/components/layout/timeline-panel.tsx` — sortDesc 先按 priority 再按 pubDate 排序

### 影响范围
- 新闻时间线排序规则变更：从纯时间排序改为优先级+时间排序
- LINUX DO 正式激活为最高优先级科技源

---

## v0.1.4 - 2026-05-06

### 变更内容
- **React 重复 key 错误修复**：移除 9 个源定义中的重复短别名条目（如 `cls`/`cls-telegraph` 同时指向同一函数），消除前端 "Encountered two children with the same key" 报错
- **组件安全去重**：在 `revealNext` 和 `addToCache` 中添加 displayItems 去重逻辑
- **移除 300 条展示上限**：`revealNext` 不再截断 displayItems

### 修改文件
- `src/lib/newsnow/sources/cls/index.ts` — 移除重复的 `"cls": telegraph`
- `src/lib/newsnow/sources/bilibili.ts` — 移除重复的 `"bilibili": hotSearch`
- `src/lib/newsnow/sources/wallstreetcn.ts` — 移除重复的 `"wallstreetcn": live`
- `src/lib/newsnow/sources/_36kr.ts` — 移除重复的 `"36kr": quick`
- `src/lib/newsnow/sources/chongbuluo.ts` — 移除重复的 `"chongbuluo": hot`
- `src/lib/newsnow/sources/github.ts` — 移除重复的 `"github": trending`
- `src/lib/newsnow/sources/linuxdo.ts` — 移除重复的 `"linuxdo": latest`
- `src/lib/newsnow/sources/mktnews.ts` — 移除重复的 `"mktnews": flash`
- `src/lib/newsnow/sources/v2ex.ts` — 移除重复的 `"v2ex": share`
- `src/components/layout/timeline-panel.tsx` — revealNext/addToCache 添加 key 去重

### 影响范围
- 活跃信息源从 52 个精减为 43 个（消除 9 个重复注册）
- 前端新闻时间线不再出现重复 key 报错
- build 预存错误（5 errors with turbopack）与本变更无关

---

## v0.1.3 - 2026-05-05

### 变更内容
- **SSE 实时推送**：将新闻刷新机制从客户端轮询改造为 SSE（Server-Sent Events）服务端主动推送
- **数据库持久化**：新增 `news_timeline` 表，抓取结果同时存入数据库和推流
- **自动降级**：SSE 连接断开时自动切换为 REST API 轮询降级（每 30s）
- **globalThis 单例**：Dev 模式下 hot reload 时 SSE 客户端集存活，不丢失连接

### 新增文件
- `src/lib/newsnow/scheduler.ts` — SSE 调度器（抓取 → 存库 → 广播）
- `src/lib/db/schema.ts` — 新增 `newsTimeline` 表定义
- `src/app/api/news/stream/route.ts` — SSE 端点（ReadableStream + EventSource）

### 修改文件
- `src/components/layout/timeline-panel.tsx` — SSE 优先 + REST 降级架构
- `src/app/api/news/timeline/route.ts` — 添加去重逻辑
- `src/lib/newsnow/scheduler.ts` — 错误处理 + pubDate 类型转换
- `.env.development` — 修复 DATABASE_URL 路径（移除 file: 前缀）

### 技术要点
- SSE 通过 Next.js Route Handler + ReadableStream 实现
- globalThis 存储 SSE 客户端集和定时器，避免 dev hot reload 丢失状态
- `fetchAndBroadcast()` 每 30s 检查各源 TTL，只抓取过期源
- `buildSnapshot()` 从内存缓存构建初始快照，新客户端无需等待
- DB insert 使用 `onConflictDoNothing()` 去重
- 前端 mergeItems() 按源 top-5 合并增量数据

### 影响范围
- 新闻时间线刷新机制：从客户端拉取变为服务端推送
- 数据库新增 `nomos_dev_news_timeline` 表（254 条初始数据）
- REST API `/api/news/timeline` 保持兼容，作为降级方案

---

## v0.1.2 - 2026-05-04

### 变更内容
- **NewsNow 新闻源整合**：将 newsnow 项目中 42+ 新闻源全部移植到 NOMOS Workbench
- 独立新闻聚合子系统：不修改现有 RSS 系统，新建 `src/lib/newsnow/` 模块
- 统一时间线展示：所有平台消息按发布时间倒序排列在一条时间线中
- 自动刷新：每 60 秒轮询增量更新，顶部显示刷新状态条
- 平台来源标识：每条新闻显示彩色来源标签和来源名称

### 新增文件
- `src/lib/newsnow/types.ts` — 核心类型定义（NewsItem, TimelineItem, SourceGetter）
- `src/lib/newsnow/constants.ts` — 刷新间隔常量（Realtime/Fast/Common/Slow）
- `src/lib/newsnow/sources.ts` — 42+ 源定义与元数据注册表
- `src/lib/newsnow/cache.ts` — 内存缓存层（按源 TTL 自动过期）
- `src/lib/newsnow/utils.ts` — 共用工具（myFetch/defineSource/defineRSSSource/加密）
- `src/lib/newsnow/date.ts` — 日期解析（parseRelativeDate/tranformToUTC）
- `src/lib/newsnow/sources/*.ts` — 46 个抓取器（cheerio/JSON API）
- `src/app/api/news/timeline/route.ts` — GET 聚合 API（公开访问）

### 修改文件
- `src/components/layout/timeline-panel.tsx` — 改造 NewsTimeline 为统一时间线

### 技术要点
- cheerio + ofetch 抓取层，与 newsnow 一致
- `defineSource()` 标识函数适配器，允许抓取器无修改即可工作
- `Promise.allSettled` 并行抓取，单源失败不影响整体
- 客户端增量轮询（`?since=<timestamp>`），避免重复拉取

### 影响范围
- 前端 Timeline Panel：News tab 显示统一时间线
- 不再修改现有 RSS 系统和 newsItems/newsSources 数据库表

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
