import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import { defineWorkersProject, readD1Migrations } from '@cloudflare/vitest-pool-workers/config';
import path from 'node:path';

// export default defineWorkersProject(async () => {
// 	const migrationsPath = path.join(__dirname, 'migrations');
// 	const migrations = await readD1Migrations(migrationsPath);
// 	return {
// 		test: {
// 			setupFiles: ['./test/apply-migrations.ts'],
// 			poolOptions: {
// 				workers: {
//                     singleWorker: true,
//                     isolatedStorage: false,
// 					wrangler: { configPath: './wrangler.toml' },
// 					miniflare: {
// 						bindings: { TEST_MIGRATIONS: migrations },
// 					},
// 				},
// 			},
// 		},
// 	};
// });
// export default defineWorkersConfig({
//   test: {
//     setupFiles: ["./test/apply-migrations.ts"],
//     poolOptions: {
//       workers: {
//         wrangler: { configPath: "./wrangler.toml" },
//         miniflare:{
//             bindings: { TEST_MIGRATIONS: migrations },
//         }
//       },
//     },
//   },
// });
