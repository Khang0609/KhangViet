CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`service_category` text,
	`project_scale` text,
	`message` text,
	`status` text DEFAULT 'NEW' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_leads_status` ON `leads` (`status`);--> statement-breakpoint
CREATE INDEX `idx_leads_created_at` ON `leads` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_leads_phone` ON `leads` (`phone`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`client` text NOT NULL,
	`locations` text NOT NULL,
	`year` text NOT NULL,
	`category_tag` text NOT NULL,
	`scale_metric` text NOT NULL,
	`materials` text NOT NULL,
	`engineering_notes` text NOT NULL,
	`summary` text NOT NULL,
	`cover_image` text NOT NULL,
	`gallery` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_code_unique` ON `projects` (`code`);--> statement-breakpoint
CREATE INDEX `idx_projects_code` ON `projects` (`code`);--> statement-breakpoint
CREATE INDEX `idx_projects_category` ON `projects` (`category_tag`);--> statement-breakpoint
CREATE TABLE `cms_metadata` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pending_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`target_id` text,
	`payload` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` text NOT NULL,
	`applied_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_pending_changes_status` ON `pending_changes` (`status`);--> statement-breakpoint
CREATE INDEX `idx_pending_changes_created` ON `pending_changes` (`created_at`);