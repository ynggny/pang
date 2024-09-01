import { z, createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { drizzle } from 'drizzle-orm/d1';
import { users, userVersions, refreshTokens } from './schema';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

const app = new OpenAPIHono<{ Bindings: { DB: D1Database; JWT_SECRET_KEY: string } }>();
const userPostRoute = createRoute({
	path: '/users',
	method: 'post',
	description: 'ユーザーを作成する',
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
						userName: z.string().openapi({
							description: 'ユーザー名',
							example: 'ユーザー１',
						}),
					}),
				},
			},
		},
	},
	responses: {
		201: {
			description: 'ユーザ作成成功',
			content: {
				'application/json': {
					schema: z.object({
						data: z.object({
							userId: z.number().openapi({
								description: 'ユーザID',
							}),
						}),
					}),
				},
			},
		},
		400: {
			description: 'ユーザ作成失敗',
			content: {
				'application/json': {
					schema: z.object({
						error: z.object({
							code: z.string().openapi({
								description: 'エラーコード',
								example: 'USER-001',
							}),
							message: z.string().openapi({
								description: 'エラーメッセージ',
								example: 'メールアドレスはすでに存在しています',
							}),
							details: z.string().openapi({
								description: 'エラー詳細',
								example: 'メールアドレスはすでに存在しています',
							}),
						}),
					}),
				},
			},
		},
	},
});
app.openapi(userPostRoute, async (c) => {
	const { password, email, userName } = c.req.valid('json');
	const db = drizzle(c.env.DB);

	const hashedPassword = bcrypt.hashSync(password, 10);

	const result = await db.select().from(userVersions).where(eq(userVersions.email, email)).execute();

	if (result.length > 0) {
		return c.json(
			{ error: { code: 'USER-001', message: 'ユーザーの作成に失敗しました。', details: 'メールアドレスはすでに存在しています' } },
			400,
		);
	}

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
			userName: userName,
			email: email,
			hashedPassword: hashedPassword,
			createdAt: new Date().toISOString(),
		})
		.execute();

	return c.json({ data: { userId: user[0].userId } }, 201);
});

export default app;
