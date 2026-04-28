# Phase 4 - 数据库备份 开发计划

## 当前状态
- 使用 SQLite（better-sqlite3），数据文件在 `data/workbench.db`
- 已有 `src/lib/crypto/index.ts` 提供 AES-256-GCM 加密
- 无备份机制

## 4.1 备份服务

### 4.1.1 备份核心逻辑
- [ ] 新建 `src/lib/backup/index.ts` — 备份工具模块
  - `createBackup(destPath?)` — 备份函数
    - 使用 SQLite `backup` API（而非直接复制文件，确保数据一致性）
    - 使用 `crypto/encrypt` 加密备份内容
    - 输出文件名格式：`nomos-workbench-YYYYMMDD-HHmmss.db.enc`
    - 备份元数据 JSON：时间戳、数据库大小、校验和
  - `restoreFromBackup(filePath)` — 恢复函数
    - 解密备份文件
    - 关闭当前数据库连接
    - 恢复到 `data/workbench.db`
    - 重启连接
  - `listBackups()` — 列出所有可用备份
    - 扫描备份目录
    - 返回备份文件列表（时间、大小）

### 4.1.2 备份存储
- [ ] 新建 `data/backups/` 目录
- [ ] 备份配置：
  - 本地存储：`data/backups/` 目录
  - 保留策略：��多保留最近 30 天的备份
  - 自动清理过期备份

## 4.2 API 路由

- [ ] 新建 `src/app/api/backup/route.ts`
  - POST `/api/backup` — 手动触发备份
    - 调用 `createBackup()`
    - 返回备份文件路径和大小
  - GET `/api/backup` — 获取备份列表
    - 调用 `listBackups()`
  - DELETE `/api/backup/:id` — 删除指定备份
  - POST `/api/backup/restore` — 从备份恢复
    - body: `{ backupId }`
    - 调用 `restoreFromBackup()`
    - 恢复后提示用户刷新页面

## 4.3 定时备份

- [ ] 新建 `src/lib/backup/scheduler.ts` — 定时备份调度器
  - 使用 Next.js 的 cron（`turbo.json` cron 或自定义 setInterval）
  - 默认每天凌晨 2:00 执行
  - 备份成功后删除 7 天前的旧备份
  - 记录备份日志到 `audit_logs` 表

- [ ] 新建 `src/app/api/backup/schedule/route.ts` — 定时备份管理
  - GET — 查看当前备份计划
  - POST — 修改备份计划（频率、时间）

## 4.4 备份管理 UI（可选）

- [ ] 在 Settings 页面新增备份子 tab
  - 新建 `src/components/settings/backup-settings.tsx`
  - 显示备份列表（时间、大小）
  - 手动备份按钮
  - 恢复按钮（带二次确认）
  - 删除备份按钮

---

## 交付物 checklist

- [ ] 备���核心逻辑（create/restore/list）
- [ ] 备份 API 路由
- [ ] 定时备份调度器
- [ ] 定时备份管理 API
- [ ] 备份管理 UI（Settings 中）
