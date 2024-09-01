```sh
npm install
npm run dev
```

```sh
npm run deploy
```

```sh
npx drizzle-kit generate --schema=src/schema.ts --out=migrations --dialect=sqlite
npx wrangler d1 migrations apply usagisan
```
