-- Add search_engines column to user_settings for custom search engine management
ALTER TABLE `nomos_dev_user_settings` ADD COLUMN `search_engines` text NOT NULL DEFAULT '[]';
