// import { OpenAPIHono } from '@hono/zod-openapi';
import app from '../src/index';
// import { env,SELF ,runInDurableObject} from 'cloudflare:test'
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import '../src';
import { vi, describe, beforeAll, afterAll, it, expect, beforeEach, afterEach } from 'vitest';
import * as jwt from 'hono/jwt';
import { D1Database, D1DatabaseAPI } from '@miniflare/d1';
import { createSQLiteDB } from '@miniflare/shared';
import { drizzle } from 'drizzle-orm/d1';
import { users, userVersions } from '../src/schema';
import { count } from 'drizzle-orm';
/**
 * D1Databaseを作成する
 * @returns
 */
export const createDB = async () => {
	// メモリ内のSQLiteデータベースを作成
	const sqlite = await createSQLiteDB(':memory:');
	const d1 = new D1Database(new D1DatabaseAPI(sqlite));

	// migrationsフォルダ内のすべての.sqlファイルを取得
	const migrationFiles = readdirSync(join(__dirname, '../migrations'))
		.filter((file) => file.endsWith('.sql'))
		.sort(); // 順番通りに適用するためにソート
	const sql = [];
	// 各マイグレーションファイルを順に読み込み、実行
	for (const file of migrationFiles) {
		const filePath = join(__dirname, '../migrations', file);
		const migrationSQL = readFileSync(filePath, 'utf8')
			// .replace(/\\/g, '\\\\') // バックスラッシュをエスケープ
			.replace(/\n/g, ' ') // 改行をスペースに置換
			.replace(/\s+/g, ' ') // 複数のスペースを単一のスペースに置換
			.replace(/;/g, ';\n') // 複数のスペースを単一のスペースに置換
			.trim();
		sql.push(migrationSQL);
	}
	for (const s of sql) {
		console.log(`Executing SQL: ${s}`);
		try {
			if (s.trim() === '') continue;
			await d1.exec(s);
		} catch (error) {
			console.error(`Error executing SQL: ${s}`, error);
			break; // エラーが発生したらループを停止
		}
	}
	return d1;
};

/**
 * ログインをスキップする
 */
// export const skipAuth = () => {
// 	vi.mock('hono/jwt')
// 	vi.spyOn(jwt, 'verify').mockReturnValue(Promise.resolve({ sub: 1 }));
// };
// afterEach(() => {
// 	console.log("😺😺😺😺😺😺😺😺😺😺😺😺😺")
// 	vi.restoreAllMocks(); // すべてのモックとスパイを元に戻す
// });
