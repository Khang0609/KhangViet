PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `organizations` (
	`identity_id` text PRIMARY KEY NOT NULL,
	`scale` text,
	`description` text,
	`logo_url` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`identity_id`) REFERENCES `identities`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `key_accounts` (
	`organization_id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`tag` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`identity_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `key_accounts_slug_unique` ON `key_accounts` (`slug`);
--> statement-breakpoint
CREATE INDEX `idx_key_accounts_sort` ON `key_accounts` (`sort_order`);
--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text NOT NULL,
	`client` text NOT NULL,
	`client_identity_id` text,
	`key_account_id` text,
	`segment` text DEFAULT 'B2B' NOT NULL,
	`stage` text DEFAULT 'COMPLETED' NOT NULL,
	`locations` text NOT NULL,
	`year` integer NOT NULL,
	`category_tag` text NOT NULL,
	`scale_metric` text NOT NULL,
	`team_and_timeline` text,
	`materials` text NOT NULL,
	`engineering_notes` text NOT NULL,
	`summary` text NOT NULL,
	`cover_image` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`client_identity_id`) REFERENCES `identities`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`key_account_id`) REFERENCES `key_accounts`(`organization_id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT `projects_year_range` CHECK(`year` >= 1990 AND `year` <= 2100),
	CONSTRAINT `check_projects_segment` CHECK(`segment` IN ('B2B', 'C2B')),
	CONSTRAINT `check_projects_stage` CHECK(`stage` IN ('COMPLETED', 'TENDER_3D'))
);
--> statement-breakpoint
INSERT INTO `__new_projects` (
	`id`, `code`, `title`, `subtitle`, `client`, `client_identity_id`,
	`locations`, `year`, `category_tag`, `scale_metric`, `materials`,
	`engineering_notes`, `summary`, `cover_image`, `created_at`, `updated_at`
)
SELECT
	`id`, `code`, `title`, `subtitle`, `client`, `client_identity_id`,
	`locations`, `year`, `category_tag`, `scale_metric`, `materials`,
	`engineering_notes`, `summary`, `cover_image`, `created_at`, `updated_at`
FROM `projects`;
--> statement-breakpoint
DROP TABLE `projects`;
--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_code_unique` ON `projects` (`code`);
--> statement-breakpoint
CREATE INDEX `idx_projects_gallery_filter` ON `projects` (`segment`, `stage`, `category_tag`);
--> statement-breakpoint
CREATE INDEX `idx_projects_key_account` ON `projects` (`key_account_id`);
--> statement-breakpoint
CREATE TABLE `__new_project_media` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`media_type` text DEFAULT 'ACTUAL' NOT NULL,
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
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT `check_project_media_type` CHECK(`media_type` IN ('ACTUAL', 'RENDER_3D', 'CONSTRUCTION', 'FLOOR_PLAN', 'COVER', 'GALLERY_IMAGE', 'VIDEO'))
);
--> statement-breakpoint
INSERT INTO `__new_project_media` (
	`id`, `project_id`, `media_type`, `r2_key`, `public_url`, `caption`,
	`location`, `spec`, `aspect_ratio`, `width_px`, `height_px`,
	`file_size_bytes`, `sort_order`, `created_at`
)
SELECT
	`id`, `project_id`,
	CASE WHEN `media_type` = 'GALLERY_IMAGE' THEN 'ACTUAL' ELSE `media_type` END,
	`r2_key`, `public_url`, `caption`,
	`location`, `spec`, `aspect_ratio`, `width_px`, `height_px`,
	`file_size_bytes`, `sort_order`, `created_at`
FROM `project_media`;
--> statement-breakpoint
DROP TABLE `project_media`;
--> statement-breakpoint
ALTER TABLE `__new_project_media` RENAME TO `project_media`;
--> statement-breakpoint
CREATE INDEX `idx_project_media_lookup` ON `project_media` (`project_id`, `media_type`, `sort_order`);
--> statement-breakpoint
CREATE TABLE `project_comparisons` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`label` text NOT NULL,
	`render_media_id` text NOT NULL,
	`actual_media_id` text NOT NULL,
	`aspect_ratio` text DEFAULT '16/10' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`render_media_id`) REFERENCES `project_media`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actual_media_id`) REFERENCES `project_media`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_project_comparisons_project` ON `project_comparisons` (`project_id`, `sort_order`);
--> statement-breakpoint
CREATE TABLE `landing_placements` (
	`id` text PRIMARY KEY NOT NULL,
	`slot_type` text NOT NULL,
	`project_id` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`custom_meta` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT `check_landing_slot_type` CHECK(`slot_type` IN ('HERO_SLIDE', 'FEATURED_SHOWCASE'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_landing_placements_slot_project` ON `landing_placements` (`slot_type`, `project_id`);
--> statement-breakpoint
CREATE INDEX `idx_landing_placements_slot` ON `landing_placements` (`slot_type`, `sort_order`);
--> statement-breakpoint
PRAGMA foreign_keys=ON;
