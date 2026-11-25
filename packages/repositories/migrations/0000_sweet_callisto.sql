CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`logo_key` text,
	`is_featured` integer DEFAULT 0 NOT NULL,
	`featured_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_unique` ON `organizations` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_organizations_featured` ON `organizations` (`is_featured`,`featured_order`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`summary` text,
	`organization_id` text,
	`year` integer,
	`publish_status` text DEFAULT 'DRAFT' NOT NULL,
	`is_featured` integer DEFAULT 0 NOT NULL,
	`featured_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "check_projects_publish_status" CHECK("projects"."publish_status" IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_projects_publish_featured` ON `projects` (`publish_status`,`is_featured`,`featured_order`);--> statement-breakpoint
CREATE INDEX `idx_projects_org` ON `projects` (`organization_id`);--> statement-breakpoint
CREATE TABLE `project_services` (
	`project_id` text NOT NULL,
	`service_id` text NOT NULL,
	PRIMARY KEY(`project_id`, `service_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_project_services_service` ON `project_services` (`service_id`);--> statement-breakpoint
CREATE TABLE `project_media` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`kind` text DEFAULT 'GALLERY' NOT NULL,
	`storage_key` text NOT NULL,
	`alt_text` text,
	`caption` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_cover` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "check_project_media_kind" CHECK("project_media"."kind" IN ('RENDER', 'ACTUAL', 'HERO', 'GALLERY'))
);
--> statement-breakpoint
CREATE INDEX `idx_project_media_project_sort` ON `project_media` (`project_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `project_comparisons` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`render_media_id` text NOT NULL,
	`actual_media_id` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`render_media_id`) REFERENCES `project_media`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actual_media_id`) REFERENCES `project_media`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_project_comparisons_project` ON `project_comparisons` (`project_id`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text NOT NULL,
	`company_name` text,
	`service_id` text,
	`message` text,
	`budget_range` text,
	`source` text,
	`status` text DEFAULT 'NEW' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "check_leads_status" CHECK("leads"."status" IN ('NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST'))
);
--> statement-breakpoint
CREATE INDEX `idx_leads_status_created` ON `leads` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `lead_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`note` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_lead_activities_lead_created` ON `lead_activities` (`lead_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'STAFF' NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT "check_users_role" CHECK("users"."role" IN ('ADMIN', 'STAFF'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text NOT NULL,
	`updated_at` integer NOT NULL
);
