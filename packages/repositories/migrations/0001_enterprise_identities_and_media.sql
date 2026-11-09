PRAGMA foreign_keys = OFF;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `identities` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`tax_code` text,
	`identity_type` text DEFAULT 'INDIVIDUAL' NOT NULL,
	`address` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_identities_phone` ON `identities` (`phone`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`identity_id` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'CUSTOMER' NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `check_user_accounts_role` CHECK(`role` IN ('ADMIN', 'STAFF', 'CUSTOMER')),
	FOREIGN KEY (`identity_id`) REFERENCES `identities`(`id`) ON UPDATE no action ON DELETE restrict
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `user_accounts_email_unique` ON `user_accounts` (`email`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `leads_new` (
	`id` text PRIMARY KEY NOT NULL,
	`identity_id` text NOT NULL,
	`service_category` text,
	`project_scale` text,
	`initial_message` text,
	`status` text DEFAULT 'NEW' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `check_leads_status` CHECK(`status` IN ('NEW', 'CONTACTED', 'SURVEY_SCHEDULED', 'QUOTED', 'WON', 'LOST')),
	FOREIGN KEY (`identity_id`) REFERENCES `identities`(`id`) ON UPDATE no action ON DELETE restrict
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `lead_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`staff_identity_id` text,
	`action_type` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads_new`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`staff_identity_id`) REFERENCES `identities`(`id`) ON UPDATE no action ON DELETE set null
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_lead_activities_lead_id` ON `lead_activities` (`lead_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `projects_new` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`client` text NOT NULL,
	`client_identity_id` text,
	`locations` text NOT NULL,
	`year` integer NOT NULL,
	`category_tag` text NOT NULL,
	`scale_metric` text NOT NULL,
	`materials` text NOT NULL,
	`engineering_notes` text NOT NULL,
	`summary` text NOT NULL,
	`cover_image` text NOT NULL,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `projects_year_range` CHECK(`projects_new`.`year` >= 1990 AND `projects_new`.`year` <= 2100),
	CONSTRAINT `check_projects_status` CHECK(`status` IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
	FOREIGN KEY (`client_identity_id`) REFERENCES `identities`(`id`) ON UPDATE no action ON DELETE set null
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `project_media` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`media_type` text DEFAULT 'GALLERY_IMAGE' NOT NULL,
	`r2_key` text,
	`public_url` text NOT NULL,
	`caption` text,
	`location` text,
	`spec` text,
	`aspect_ratio` text,
	`width_px` integer,
	`height_px` integer,
	`file_size_bytes` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects_new`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_project_media_project_id` ON `project_media` (`project_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_project_media_sort` ON `project_media` (`sort_order`);--> statement-breakpoint
INSERT OR IGNORE INTO `identities` (`id`, `full_name`, `phone`, `email`, `identity_type`, `created_at`, `updated_at`)
SELECT `id`, `name`, `phone`, `email`, 'INDIVIDUAL', `created_at`, `updated_at`
FROM `users`;--> statement-breakpoint
INSERT OR IGNORE INTO `user_accounts` (`id`, `identity_id`, `email`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`)
SELECT `id`, `id`, `email`, `password`, `role`, 1, `created_at`, `updated_at`
FROM `users`;--> statement-breakpoint
INSERT OR IGNORE INTO `identities` (`id`, `full_name`, `phone`, `email`, `identity_type`, `notes`, `created_at`, `updated_at`)
SELECT `id`, `full_name`, `phone`, `email`, 'INDIVIDUAL', `notes`, `created_at`, `updated_at`
FROM `leads`;--> statement-breakpoint
INSERT OR IGNORE INTO `leads_new` (`id`, `identity_id`, `service_category`, `project_scale`, `initial_message`, `status`, `created_at`, `updated_at`)
SELECT `id`, `id`, `service_category`, `project_scale`, `message`, `status`, `created_at`, `updated_at`
FROM `leads`;--> statement-breakpoint
INSERT OR IGNORE INTO `projects_new` (`id`, `code`, `title`, `subtitle`, `client`, `locations`, `year`, `category_tag`, `scale_metric`, `materials`, `engineering_notes`, `summary`, `cover_image`, `status`, `sort_order`, `created_at`, `updated_at`)
SELECT `id`, `code`, `title`, `subtitle`, `client`, `locations`, CAST(`year` AS INTEGER), `category_tag`, `scale_metric`, `materials`, `engineering_notes`, `summary`, `cover_image`, 'PUBLISHED', 0, datetime('now'), datetime('now')
FROM `projects`;--> statement-breakpoint
DROP TABLE IF EXISTS `users`;--> statement-breakpoint
DROP TABLE IF EXISTS `leads`;--> statement-breakpoint
DROP TABLE IF EXISTS `projects`;--> statement-breakpoint
ALTER TABLE `leads_new` RENAME TO `leads`;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_leads_identity_id` ON `leads` (`identity_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_leads_status` ON `leads` (`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_leads_created_at` ON `leads` (`created_at`);--> statement-breakpoint
ALTER TABLE `projects_new` RENAME TO `projects`;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `projects_code_unique` ON `projects` (`code`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_projects_category` ON `projects` (`category_tag`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_projects_status` ON `projects` (`status`);--> statement-breakpoint
PRAGMA foreign_keys = ON;
