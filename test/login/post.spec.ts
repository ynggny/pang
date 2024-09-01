import { describe, it, beforeEach, vi, expect, afterEach } from 'vitest';
import { skipAuth, createDB } from '../utils';
import { D1Database } from '@miniflare/d1';
import { drizzle } from 'drizzle-orm/d1';
import app from '../../src/index';
import { count } from 'drizzle-orm';
import { users, userVersions } from '../../src/schema';
import * as bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import * as jwt from 'hono/jwt';

describe('POST /users', () => {
	describe('入力情報が不正な時', () => {
		let d1: D1Database;
		beforeEach(async () => {
			d1 = await createDB();
		});
		it('ログインできないこと', async () => {
			const db = drizzle(d1);
			const req = await app.request(
				'login',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: 'aaa@test.com',
						password: 'test',
					}),
				},
				{
					DB: d1,
					JWT_SECRET_KEY: 'test',
				},
			);
			expect(req.status).toBe(404);
			expect(await req.json()).toEqual({ error: { "code": "AUTH-001","details": "メールアドレスもしくはパスワードをご確認ください。","message": "ログインに失敗しました。", } });
		});
	});

	describe('入力情報が正しい時', () => {
		let d1: D1Database;
		beforeEach(async () => {
			d1 = await createDB();
			const db = drizzle(d1);
			const user = await db
				.insert(users)
				.values({
					currentVersion: 1,
				})
				.returning({ userId: users.userId });
			await db
				.insert(userVersions)
				.values({
					userId: user[0].userId,
					version: 1,
					userName: 'userName',
					email: 'aaa@test.com',
					hashedPassword: bcrypt.hashSync('test', 10),
					createdAt: new Date().toISOString(),
				})
				.execute();
		});

		it('ログインできること', async () => {
			const db = drizzle(d1);
			const req = await app.request(
				'login',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer test',
					},
					body: JSON.stringify({
						email: 'aaa@test.com',
						password: 'test',
					}),
				},
				{
					DB: d1,
					JWT_SECRET_KEY: [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, '0')).join(''),
				},
			);

			expect(req.status).toBe(200);
			expect(await req.json()).toEqual({
				data: { refreshToken: expect.any(String), accessToken: expect.any(String) },
			});
		});
	});
});
