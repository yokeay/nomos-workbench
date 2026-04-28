CREATE TABLE `ai_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`api_key` text,
	`base_url` text,
	`is_active` integer DEFAULT 0,
	`priority` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`detail` text,
	`ip` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`tokens` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `chat_messages_session_idx` ON `chat_messages` (`session_id`);--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`model` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `knowledge_files` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`filename` text NOT NULL,
	`filepath` text NOT NULL,
	`size` integer,
	`content_hash` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `news_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`url` text NOT NULL,
	`source` text NOT NULL,
	`published_at` integer NOT NULL,
	`event_date` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `news_items_user_date_idx` ON `news_items` (`user_id`,`event_date`);--> statement-breakpoint
CREATE INDEX `news_items_published_idx` ON `news_items` (`published_at`);--> statement-breakpoint
CREATE TABLE `news_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`category` text,
	`is_active` integer DEFAULT 1,
	`fetch_interval` integer DEFAULT 300,
	`last_fetch_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	`session_token` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_session_token_unique` ON `sessions` (`session_token`);--> statement-breakpoint
CREATE TABLE `timeline_ai_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`event_date` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `timeline_ai_user_date_idx` ON `timeline_ai_events` (`user_id`,`event_date`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`avatar` text,
	`totp_secret` text,
	`totp_enabled` integer DEFAULT 0,
	`theme` text DEFAULT 'dark',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verification_tokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL
);
