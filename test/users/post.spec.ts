import { describe, it, beforeEach, vi, expect, afterEach } from 'vitest';
import { createDB } from '../utils';
import { D1Database } from '@miniflare/d1';
import { drizzle } from 'drizzle-orm/d1';
import app from '../../src/index';
import { count } from 'drizzle-orm';
import { users, userVersions } from '../../src/schema';
import * as jwt from 'hono/jwt';

describe('POST /users', () => {
	describe('入力情報が正しいとき', () => {
		let d1: D1Database;
		beforeEach(async () => {
			vi.mock('hono/jwt');
			vi.spyOn(jwt, 'verify').mockReturnValue(Promise.resolve({ sub: 1 }));
			d1 = await createDB();
		});
		afterEach(() => {
			vi.restoreAllMocks();
		});
		it('ユーザーが作られること', async () => {
			const db = drizzle(d1);
			const req = await app.request(
				'users',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer test',
					},
					body: JSON.stringify({
						email: 'aaa@test.com',
						password: 'test',
						userName: 'test',
					}),
				},
				{
					DB: d1,
					JWT_SECRET_KEY: 'test',
				},
			);
			expect(req.status).toBe(201);
			expect(await req.json()).toEqual({ data: { userId: expect.any(Number) } });
			expect((await db.select({ count: count() }).from(users))[0].count).toBe(1);
		});
	});

	describe('メールアドレスが存在するとき', () => {
		let d1: D1Database;
		beforeEach(async () => {
			vi.mock('hono/jwt');
			vi.spyOn(jwt, 'verify').mockReturnValue(Promise.resolve({ sub: 1 }));
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
					hashedPassword: 'hashedPassword',
					createdAt: new Date().toISOString(),
				})
				.execute();
		});
		afterEach(() => {
			vi.restoreAllMocks();
		});
		it('エラーが返ってくること', async () => {
			const db = drizzle(d1);
			const req = await app.request(
				'users',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer test',
					},
					body: JSON.stringify({
						email: 'aaa@test.com',
						password: 'test',
						userName: 'test',
					}),
				},
				{
					DB: d1,
					JWT_SECRET_KEY: 'test',
				},
			);
			expect(req.status).toBe(400);
			expect(await req.json()).toEqual({
				error: { code: 'USER-001', details: 'メールアドレスはすでに存在しています', message: 'ユーザーの作成に失敗しました。' },
			});
			expect((await db.select({ count: count() }).from(users))[0].count).toBe(1);
		});
	});
});
