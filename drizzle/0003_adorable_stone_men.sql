CREATE TABLE `nomos_dev_almanac` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`data` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `nomos_dev_almanac_date_unique` ON `nomos_dev_almanac` (`date`);--> statement-breakpoint
CREATE TABLE `nomos_dev_history_onthisday` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`day` text NOT NULL,
	`data` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nomos_dev_memo_attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`memo_id` text NOT NULL,
	`filename` text NOT NULL,
	`filepath` text NOT NULL,
	`size` integer,
	`mime_type` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`memo_id`) REFERENCES `nomos_dev_memos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `nomos_dev_memos` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `nomos_dev_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `memos_user_idx` ON `nomos_dev_memos` (`user_id`);--> statement-breakpoint
CREATE INDEX `memos_created_idx` ON `nomos_dev_memos` (`created_at`);--> statement-breakpoint
CREATE TABLE `nomos_dev_news_timeline` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`source_name` text NOT NULL,
	`source_color` text DEFAULT 'gray',
	`title` text NOT NULL,
	`url` text NOT NULL,
	`extra` text,
	`pub_date` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `news_timeline_pubdate_idx` ON `nomos_dev_news_timeline` (`pub_date`);--> statement-breakpoint
CREATE TABLE `nomos_dev_storage_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text DEFAULT 'local' NOT NULL,
	`config` text DEFAULT '{}' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nomos_dev_todos` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`title` text NOT NULL,
	`content` text DEFAULT '',
	`sort_order` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `nomos_dev_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `todos_user_date_idx` ON `nomos_dev_todos` (`user_id`,`date`);--> statement-breakpoint
CREATE INDEX `todos_sort_idx` ON `nomos_dev_todos` (`user_id`,`date`,`sort_order`);--> statement-breakpoint
ALTER TABLE `nomos_dev_users` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `nomos_dev_users` ADD `github_id` text;