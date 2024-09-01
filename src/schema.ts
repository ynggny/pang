import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	userId: integer('user_id').primaryKey({ autoIncrement: true }).notNull(),
	currentVersion: integer('current_version').notNull(),
});

export const userVersions = sqliteTable('user_versions', {
	userVersionId: integer('user_version_id').primaryKey({ autoIncrement: true }).notNull(),
	userId: integer('user_id')
		.references(() => users.userId)
		.notNull(),
	version: integer('version').notNull(),
	userName: text('user_name').notNull(),
	email: text('email').notNull(),
	hashedPassword: text('hashed_password').notNull(),
	createdAt: text('created_at').notNull(),
});

export const refreshTokens = sqliteTable('refresh_tokens', {
	refresh_token_id: integer('refresh_token_id').primaryKey({ autoIncrement: true }).notNull(),
	userId: integer('user_id')
		.references(() => users.userId)
		.notNull(),
	version: integer('version').notNull(),
	token: text('token').notNull(),
	expires_at: text('expires_at').notNull(),
	createdAt: text('created_at').notNull(),
});
