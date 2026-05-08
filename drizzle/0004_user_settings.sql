-- Create user_settings table (consolidates per-user preferences)
CREATE TABLE `nomos_dev_user_settings` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `user_id` TEXT NOT NULL UNIQUE REFERENCES `nomos_dev_users`(`id`),
  `theme` TEXT NOT NULL DEFAULT 'dark',
  `locale` TEXT NOT NULL DEFAULT 'zh',
  `news_filter` TEXT NOT NULL DEFAULT '[]',
  `terminal_ws_url` TEXT NOT NULL DEFAULT '',
  `storage_provider` TEXT NOT NULL DEFAULT 'local',
  `storage_config` TEXT NOT NULL DEFAULT '{}',
  `created_at` INTEGER NOT NULL,
  `updated_at` INTEGER NOT NULL
);

-- Migrate existing theme from users table
INSERT INTO `nomos_dev_user_settings` (`user_id`, `theme`, `created_at`, `updated_at`)
SELECT `id`, COALESCE(`theme`, 'dark'), `created_at`, `updated_at`
FROM `nomos_dev_users`
WHERE `id` NOT IN (SELECT `user_id` FROM `nomos_dev_user_settings`);
