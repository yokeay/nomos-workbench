# 整改计划：硬编码文案清除 + 页面异常修复

**创建时间：** 2026-04-29
**问题来源：** 页面截图显示输入框 placeholder 为 "Search or type a message..." 等硬编码英文

---

## 一、硬编码文案清单（共 6 个文件，47+ 处）

### 1. settings/page.tsx（严重，24 处）

| 行号 | 硬编码文案 | 位置 |
|------|-----------|------|
| 49 | `"Name"` | label |
| 53 | `"Email"` | label |
| 78 | `"English"` | Button children |
| 90 | `"Backup"` | h2 标题 |
| 137 | `"Provider"` | label |
| 139 | `"Anthropic"` | option |
| 140 | `"OpenAI"` | option |
| 141 | `"Ollama"` | option |
| 145 | `"Model"` | label |
| 150 | `"API Key"` | label |
| 151 | `placeholder="sk-..."` | placeholder（本身没问题但需确认翻译） |
| 154 | `"Base URL (optional)"` | label |
| 158 | `'Save'` / `'...'` | Button 保存按钮 |
| 163 | `'(active)'` | 状态文字 |
| 164 | `'no key'` | 状态文字 |
| 197 | `confirm('Restore from ...')` | 浏览器确认弹窗 |
| 197 | `'Restore from ' + name + '? This will overwrite current data.'` | 确认弹窗文案 |
| 205 | `alert('Restored. Reloading...')` | 浏览器 alert |
| 211 | `'Create Backup'` / `'...'` | Button 创建备份 |
| 216 | `"Restore"` | Button 恢复按钮 |
| 219 | `"No backups"` | 空状态文字 |

### 2. calendar/page.tsx（中等，8 处）

| 行号 | 硬编码文案 | 位置 |
|------|-----------|------|
| 18 | `toLocaleDateString('zh-CN', ...)` | 月份标签固定中文，不跟随 locale |
| 31-33 | `"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"` | 星期头硬编码英文 |
| 59 | `"No events"` | 空状态文字 |

### 3. terminal-card.tsx（中等，4 处）

| 行号 | 硬编码文案 | 位置 |
|------|-----------|------|
| 72 | `"Connected to terminal server"` | WebSocket 连接成功消息 |
| 80 | `"Connection closed"` | WebSocket 断开消息 |
| 84 | `"Connection error"` | WebSocket 错误消息 |
| 120/127 | `title="Maximize"` / `title="Close"` | 按钮 title 属性 |

### 4. model-selector.tsx（中等，12 处）

| 行号 | 硬编码文案 | 位置 |
|------|-----------|------|
| 11-16 | `"Claude 3.5 Sonnet"`, `"GPT-4o"`, `"GPT-4 Turbo"`, `"GPT-3.5 Turbo"`, `"Llama 3"`, `"Qwen 2"` | 模型名称 label |
| 11-16 | `"Anthropic"`, `"OpenAI"`, `"Ollama"` | 提供商名称 |

> 注意：模型名和提供商名本身是专有名词，可以考虑不翻译，但应通过 i18n key 引用以便未来多语言扩展。

### 5. chat-messages.tsx（轻微，1 处）

| 行号 | 硬编码文案 | 位置 |
|------|-----------|------|
| 21 | `"AI"` | 流式输出时 avatar 显示文字 |

### 6. chat-container.tsx（轻微，1 处）

| 行号 | 硬编码文案 | 位置 |
|------|-----------|------|
| 105 | placeholder 使用了 `t('chat.placeholder')` 但 i18n 中 en 文案为 `"Type your message..."`，而截图显示的是 `"Search or type a message..."` | **可能是旧版本代码未更新或 i18n 未正确加载** |

---

## 二、其他页面异常问题

### 7. settings/page.tsx - 使用原生浏览器弹窗（2 处）
- `confirm()` 和 `alert()` 应替换为项目的 Toast 系统（`useToast()`）

### 8. calendar/page.tsx - 月份不跟随语言
- `toLocaleDateString('zh-CN', ...)` 硬编码中文区域，切换为英文时应显示英文月份

### 9. settings/page.tsx - 语言切换按钮文案硬编码
- `"中文"` 和 `"English"` 直接写在 JSX 中，应使用 i18n

---

## 三、整改方案

### Phase A: 补全 i18n 翻译配置

文件：`src/i18n/config.ts`

需要新增的翻译 key：

```
calendar.weekdays           → "日,一,二,三,四,五,六" / "Su,Mo,Tu,We,Th,Fr,Sa"
calendar.monthLabel         → 动态格式化工ule（不需要静态翻译，需要代码修改）
calendar.noEvents           → "暂无事件" / "No events"
calendar.addEvent           → "添加事件" / "Add Event"

settings.name               → "姓名" / "Name"
settings.email              → "邮箱" / "Email"
settings.backup             → "数据备份" / "Backup"
settings.backupCreate       → "创建备份" / "Create Backup"
settings.backupRestore      → "恢复" / "Restore"
settings.backupNone         → "暂无备份" / "No backups"
settings.backupConfirm      → "从 {name} 恢复？这将覆盖当前数据。" / "Restore from {name}? This will overwrite current data."
settings.backupRestored     → "已恢复，正在重新加载..." / "Restored. Reloading..."
settings.provider           → "提供商" / "Provider"
settings.model              → "模型" / "Model"
settings.apiKey             → "API 密钥" / "API Key"
settings.baseUrl            → "基础 URL（可选）" / "Base URL (optional)"
settings.save               → "保存" / "Save"
settings.saving             → "保存中..." / "Saving..."
settings.apiKeyActive       → "（使用中）" / "(active)"
settings.apiKeyNone         → "未设置" / "no key"

terminal.connected          → "已连接到终端服务器" / "Connected to terminal server"
terminal.disconnected       → "连接已断开" / "Connection closed"
terminal.connectError       → "连接错误" / "Connection error"
terminal.maximize           → "最大化" / "Maximize"
terminal.close              → "关闭" / "Close"

chat.aiLabel                → "AI" / "AI"
models.xxx                  → 模型名称（可选，专有名词暂不翻译）
```

### Phase B: 逐个文件替换硬编码文案

1. **settings/page.tsx** - 替换所有 label、button、状态文字为 `t()` 调用
2. **calendar/page.tsx** - 替换星期头、空状态、月份格式化跟随 locale
3. **terminal-card.tsx** - 替换 WebSocket 消息和按钮 title
4. **model-selector.tsx** - 接受 locale prop，模型名通过 i18n 引用
5. **chat-messages.tsx** - 替换 "AI" 为 `t('chat.aiLabel')`
6. **settings/page.tsx** - 替换 `confirm()`/`alert()` 为 `useToast()`

### Phase C: 验证

- 切换中英文，检查所有页面文案是否正确切换
- 检查 settings 页面所有字段
- 检查 calendar 星期和月份跟随语言
- 检查 terminal 连接消息

---

## 四、工作量评估

| 阶段 | 文件数 | 改动量 | 预估 |
|------|--------|--------|------|
| Phase A: 补全翻译 | 1 | ~40 个 key | 10 min |
| Phase B: 替换文案 | 5 | ~47 处替换 | 20 min |
| Phase C: 验证 | - | 切换语言检查 | 5 min |
| **合计** | **6 文件** | **~87 处改动** | **~35 min** |
