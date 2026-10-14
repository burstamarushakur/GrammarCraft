CREATE TABLE `game_progress` (
	`student_id` text PRIMARY KEY NOT NULL,
	`reset_version` integer DEFAULT 0 NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`progress_json` text DEFAULT '{}' NOT NULL,
	`updated_at` text,
	`reset_at` text
);
--> statement-breakpoint
CREATE TABLE `game_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`reset_version` integer NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `game_progress`(`student_id`) ON UPDATE no action ON DELETE no action
);
