import { z, createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { userVersions, refreshTokens } from './schema';
import * as bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';

const app = new OpenAPIHono<{ Bindings: { DB: D1Database; JWT_SECRET_KEY: string } }>();

const loginPostRoute = createRoute({
	path: '/login',
	method: 'post',
	description: 'ログインする',
	request: {
		body: {
			content: {
				'application/json': {
					schema: z.object({
						email: z.string().email().openapi({
							description: 'メールアドレス',
							example: 'aaa@aaa.com',
						}),
						password: z.string().openapi({
							description: 'パスワード',
							example: 'password',
						}),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			description: 'ログイン成功',
			content: {
				'application/json': {
					schema: z.object({
						data: z.object({
							refreshToken: z.string().openapi({
								description: 'リフレッシュトークン',
							}),
							accessToken: z.string().openapi({
								description: 'アクセストークン',
							}),
						}),
					}),
				},
			},
		},
		404: {
			description: 'ログイン失敗',
			content: {
				'application/json': {
					schema: z.object({
						error: z.object({
							code: z.string().openapi({
								description: 'エラーコード',
								example: 'AUTH-001',
							}),
							message: z.string().openapi({
								description: 'エラーメッセージ概要',
								example: 'ユーザーが見つかりませんでした。',
							}),
							details: z.string().openapi({
								description: 'エラー詳細',
								example: 'お探しのユーザーは見つかりませんでした。',
							}),
						}),
					}),
				},
			},
		},
	},
});
app.openapi(loginPostRoute, async (c) => {
	const { password, email } = c.req.valid('json');

	const db = drizzle(c.env.DB);

	const usersResult = await db
		.select()
		.from(userVersions)
		.where(eq(userVersions.email, email))
		.orderBy(desc(userVersions.version))
		.limit(1);

	if (usersResult.length === 0) {
		return c.json(
			{
				error: {
					code: 'AUTH-001',
					message: 'ログインに失敗しました。',
					details: 'メールアドレスもしくはパスワードをご確認ください。',
				},
			},
			404,
		);
	}

	const user = usersResult[0];

	const passwordResult = bcrypt.compareSync(password, user.hashedPassword);

	if (!passwordResult) {
		return c.json(
			{
				error: {
					code: 'AUTH-001',
					message: 'ログインに失敗しました。',
					details: 'メールアドレスもしくはパスワードをご確認ください。',
				},
			},
			404,
		);
	}

	const token = await sign(
		{
			iss: 'yng',
			sub: user.userId,
			exp: Math.floor(Date.now() / 1000) + 60 * 0.5,
		},
		c.env.JWT_SECRET_KEY,
		'HS256',
	);
	const refreshToken = btoa([...crypto.getRandomValues(new Uint8Array(64))].map((v) => String.fromCharCode(v)).join(''));
	await db.insert(refreshTokens).values({
		userId: user.userId,
		version: user.version,
		token: refreshToken,
		expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
		createdAt: new Date().toISOString(),
	});

	return c.json(
		{
			data: { refreshToken, accessToken: token },
		},
		200,
	);
});

export default app;
