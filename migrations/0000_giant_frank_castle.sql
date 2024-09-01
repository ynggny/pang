CREATE TABLE `user_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`version` integer NOT NULL,
	`user_name` text NOT NULL,
	`email` text NOT NULL,
	`hashed_password` text NOT NULL,
	`created_at` integer NOT NULL
);

CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`version` integer NOT NULL,
	`email` integer NOT NULL
);
