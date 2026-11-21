# Production Deployment Guide (Cloudflare Workers + D1)

## 1. Create Cloudflare D1 Database

```bash
npx wrangler login
npx wrangler d1 create khangviet-db
```

Save the `database_name` and `database_id` from the CLI output.

## 2. Configure `apps/api/wrangler.jsonc`

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "api",
  "main": "src/index.ts",
  "compatibility_date": "2026-08-18",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "khangviet-db",
      "database_id": "<YOUR_D1_DATABASE_ID>"
    }
  ],
  "vars": {
    "NODE_ENV": "production",
    "WEB_APP_URL": "https://khangviet.vn"
  }
}
```

> Never commit API tokens or credentials. See `.agents/GEMINI.private.md` for private parameters.

## 3. Run Remote D1 Migration

```bash
npx wrangler d1 execute khangviet-db --remote --file=packages/repositories/migrations/0000_magenta_midnight.sql
```

## 4. Set Production Secrets

```bash
npx wrangler secret put JWT_SECRET
```

## 5. Test & Deploy

```bash
pnpm --filter api test:auth
pnpm --filter api deploy
```
