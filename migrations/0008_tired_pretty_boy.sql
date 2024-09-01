ALTER TABLE `users` RENAME TO `old_users`;
ALTER TABLE `old_users` RENAME COLUMN `id` TO `user_id`;
