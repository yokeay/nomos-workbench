# Phase 2 - 国际化 开发计划

## 2.1 i18n 集成（基于现有 i18next）

### 当前状态
- `package.json` 已安装 `i18next` + `react-i18next`
- `src/i18n/config.ts` 已有双语翻译常量（zh / en），但未被任何组件引用
- 所有 UI 文案硬编码在组件中（英文）

### 2.1.1 初始化 i18next
- [ ] 新建 `src/lib/i18n.ts`
  - 初始化 `i18next` 实例
  - 配置 `resources` 引入 `src/i18n/config.ts` 中的 `TRANSLATIONS`
  - 设置 `fallbackLng = 'zh'`、`interpolation.escapeValue = false`（React 不需要转义）

### 2.1.2 语言 Store
- [ ] 修改 `src/stores/index.ts` — `SettingsState` 增加 `locale` 字段
  - `locale: 'zh' | 'en'`
  - `setLocale(locale)` action，切换时调用 `i18n.changeLanguage()`
  - 从 localStorage 读取用户上次选择的语言
- [ ] 修改 `src/app/layout.tsx`
  - 引入 `src/lib/i18n.ts` 初始化 i18next
  - 用 `<I18nextProvider>` 包裹根布局

### 2.1.3 文案提取（逐个组件改造）

需要提取文案的文件列表及任务：

- [ ] `src/components/layout/header.tsx`
  - 搜索框 placeholder → `t('header.search')`
  - 主题切换文案 → `t('header.lightMode')` / `t('header.darkMode')`
  - 下拉菜单 "Profile Settings" / "Sign Out" → `t('common.profile')` / `t('common.logout')`

- [ ] `src/components/layout/sidebar.tsx`
  - "Dashboard" / "Calendar" / "Settings" → `t('sidebar.*')`
  - Terminal 按钮文案

- [ ] `src/components/layout/timeline-panel.tsx`
  - "AI" / "News" tabs → `t('timeline.*')`
  - 占位文案

- [ ] `src/components/chat/chat-container.tsx`
  - 输入框 placeholder → `t('chat.placeholder')`
  - 发送按钮 → `t('common.send')`

- [ ] `src/components/chat/model-selector.tsx`
  - 模型选择器标题 → `t('chat.modelSelector')`

- [ ] `src/components/chat/message-bubble.tsx`
  - 用户/AI 标签

- [ ] `src/components/terminal/terminal-card.tsx`
  - 终端标题和按钮文案

- [ ] `src/i18n/config.ts`
  - 补充上述提取出的新翻译 key（如果已有常量中缺失）

---

## 2.2 路由前缀（可选，优先级低）

### 说明
Next.js App Router 中 i18n 路由前缀需要 `next-intl` 或手动配置。
考虑到项目已用 i18next，建议先不做路由前缀，通过 Settings 中的语言切换完成国际化。
如果后续需要 `/(zh|en)/` 路由前缀，则迁移到 `next-intl`。

- [ ] 评估是否需要路由前缀（取决于用户确认）

---

## 2.3 语言切换入口

- [ ] 修改 `src/components/layout/header.tsx`
  - 用户下拉菜单中增加语言切换项：中文 / English
  - 切换时调用 `useSettingsStore.setLocale()`

---

## 交付物 checklist

- [ ] i18next 初始化文件
- [ ] SettingsStore 增加 locale
- [ ] 根布局引入 I18nextProvider
- [ ] Header 文案提取
- [ ] Sidebar 文案提取
- [ ] TimelinePanel 文案提取
- [ ] Chat 文案提取
- [ ] Terminal 文案提取
- [ ] i18n/config.ts 补充翻译
- [ ] Header 语言切换入口
