import { OpenAPIHono } from '@hono/zod-openapi';
import logins from './login';
import users from './users';
import { verify } from 'hono/jwt';
import { JwtTokenExpired, JwtTokenInvalid, JwtTokenIssuedAt, JwtTokenNotBefore, JwtTokenSignatureMismatched } from 'hono/utils/jwt/types';

type Bindings = {
	DB: D1Database;
	JWT_SECRET_KEY: string;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();
app.use('/*', async (c, next) => {
	if (c.req.path === '/login') {
		await next();
	} else {
		const authorizationHeader = c.req.header('Authorization');

		if (authorizationHeader == undefined) {
			c.status(401);
			return c.json({ error: { code: 'AUTH-002', message: '認証に失敗しました。', details: '再度ログインをお試しください。' } });
		}

		const beaerToken = authorizationHeader.split(' ')[1];

		if (beaerToken == undefined) {
			c.status(401);
			return c.json({ error: { code: 'AUTH-003', message: '認証に失敗しました。', details: '再度ログインをお試しください。' } });
		}
		try {
			// console.log(JSON.stringify(verify))
			const result = await verify(beaerToken, c.env.JWT_SECRET_KEY, 'HS256');
			return await next();
		} catch (e) {
			if (e instanceof JwtTokenInvalid) {
				c.status(401);
				return c.json({ error: { code: 'AUTH-004', message: '認証に失敗しました。', details: '再度ログインをお試しください。' } });
			} else if (e instanceof JwtTokenNotBefore) {
				c.status(401);
				return c.json({ error: { code: 'AUTH-005', message: '認証に失敗しました。', details: '再度ログインをお試しください。' } });
			} else if (e instanceof JwtTokenExpired) {
				c.status(401);
				return c.json({ error: { code: 'AUTH-006', message: '認証に失敗しました。', details: '再度ログインをお試しください。' } });
			} else if (e instanceof JwtTokenIssuedAt) {
				c.status(401);
				return c.json({ error: { code: 'AUTH-007', message: '認証に失敗しました。', details: '再度ログインをお試しください。' } });
			} else if (e instanceof JwtTokenSignatureMismatched) {
				c.status(401);
				return c.json({ error: { code: 'AUTH-008', message: '認証に失敗しました。', details: '再度ログインをお試しください。' } });
			} else {
				console.log(e);
				c.status(401);
				return c.json({ error: { code: 'AUTH-009', message: '認証に失敗しました。', details: '再度ログインをお試しください。' } });
			}
		}

		// throw new Error(JSON.stringify(c.req.header));
		// const bearer = bearerAuth({ verifyToken(token, c) {
		// // 	next()
		// // 	return c.tr
		// // 	return token === 'test';
		// // }, })
		// try {
		// 	// return bearer(c, next);
		// } catch (e) {
		// 	return c.status(666)
		// 	// c.res = new Response(JSON.stringify({ error: { code: 'AUTH-002', message: '認証に失敗しました。', details: '再度ログインをお試しください。' } }), {
		// 	// 	status: 401,
		// 	// 	headers: {
		// 	// 	},
		// 	//   })
		// 	throw new Error('認証に失敗しました。');
		// 	// await next()
		// }
	}
});
app.route('/', logins);
app.route('/', users);

console.log(
	JSON.stringify(
		app.getOpenAPI31Document({
			openapi: '3.1.0',
			info: {
				title: 'API',
				version: '1.0',
			},
		}),
	),
);
export default app;
