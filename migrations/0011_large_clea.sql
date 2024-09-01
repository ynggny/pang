CREATE TABLE `user_versions` (
	`user_version_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`version` integer NOT NULL,
	`user_name` text NOT NULL,
	`email` text NOT NULL,
	`hashed_password` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `users` (
	`user_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`current_version` integer NOT NULL
);
