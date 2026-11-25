er:info] GET /\_next/static/chunks/app/page-adfc1f9403176377.js 304 Not Modified (11ms)
X [ERROR] [CRITICAL ERROR][51995c3c-39b2-4000-995c-9d34867dd5f0] POST http://127.0.0.1:8787/api/auth/login: DrizzleQueryError: Failed query: insert into "sessions" ("id", "user_id", "expires_at", "created_at") values (?, ?, ?, ?)

params:
1d283a340a374e79b0072f8ba6d15a98884822b2ec7f4261b3203ceb08cce90b,a0000000-0000-4000-8000-000000000001,1794909924,1794305124
at D1PreparedQuery.queryWithCache
(file:///E:/lap*trinh/Project/website/KhangVietDesign/source/node_modules/.pnpm/drizzle-orm@0.45.4*@cloudflare+workers-types@4.20260702.1/node*modules/src/sqlite-core/session.ts:80:11)
at async D1PreparedQuery.run
(file:///E:/lap_trinh/Project/website/KhangVietDesign/source/node_modules/.pnpm/drizzle-orm@0.45.4*@cloudflare+workers-types@4.20260702.1/node*modules/src/d1/session.ts:202:10)
... 5 lines matching cause stack trace ...
at async dispatch
(file:///E:/lap_trinh/Project/website/KhangVietDesign/source/node_modules/.pnpm/hono@4.13.2/node_modules/hono/dist/compose.js:22:17)
at async mediaTypeGate
(file:///E:/lap_trinh/Project/website/KhangVietDesign/source/node_modules/.pnpm/@hono+zod-openapi@1.6.3_hono@4.13.2_zod@4.6.7/node_modules/@hono/zod-openapi/src/index.ts:580:11)
at async dispatch
(file:///E:/lap_trinh/Project/website/KhangVietDesign/source/node_modules/.pnpm/hono@4.13.2/node_modules/hono/dist/compose.js:22:17)
{
query: 'insert into "sessions" ("id", "user_id", "expires_at", "created_at") values (?, ?,
?, ?)',
params: [
'1d283a340a374e79b0072f8ba6d15a98884822b2ec7f4261b3203ceb08cce90b',
'a0000000-0000-4000-8000-000000000001',
1794909924,
1794305124
],
cause: Error: D1_ERROR: no such table: sessions: SQLITE_ERROR
at D1DatabaseSessionAlwaysPrimary.\_sendOrThrow (cloudflare-internal:d1-api:193:19)
at null.<anonymous> (async cloudflare-internal:d1-api:455:19)
... 7 lines matching cause stack trace ...
at async dispatch
(file:///E:/lap_trinh/Project/website/KhangVietDesign/source/node_modules/.pnpm/hono@4.13.2/node_modules/hono/dist/compose.js:22:17)
{
[cause]: Error: no such table: sessions: SQLITE_ERROR
at D1DatabaseSessionAlwaysPrimary.\_sendOrThrow (cloudflare-internal:d1-api:194:24)
at null.<anonymous> (async cloudflare-internal:d1-api:455:19)
at async D1PreparedQuery.queryWithCache
(file:///E:/lap_trinh/Project/website/KhangVietDesign/source/node_modules/.pnpm/drizzle-orm@0.45.4*@cloudflare+workers-types@4.20260702.1/node*modules/src/sqlite-core/session.ts:78:12)
at async D1PreparedQuery.run
(file:///E:/lap_trinh/Project/website/KhangVietDesign/source/node_modules/.pnpm/drizzle-orm@0.45.4*@cloudflare+workers-types@4.20260702.1/node_modules/src/d1/session.ts:202:10)
at async D1SessionRepository.createSession
(file:///E:/lap_trinh/Project/website/KhangVietDesign/source/packages/repositories/src/d1/repositories/d1-session-repository.ts:25:5)
at null.<anonymous> (async
file:///E:/lap_trinh/Project/website/KhangVietDesign/source/apps/api/.wrangler/tmp/dev-Bw23QQ/index.js:34998:21)
at async dispatch
(file:///E:/lap_trinh/Project/website/KhangVietDesign/source/node_modules/.pnpm/hono@4.13.2/node_modules/hono/dist/compose.js:22:17)
at null.<anonymous> (async
file:///E:/lap_trinh/Project/website/KhangVietDesign/source/apps/api/.wrangler/tmp/dev-Bw23QQ/index.js:2273:12)
at async mw
(file:///E:/lap_trinh/Project/website/KhangVietDesign/source/node_modules/.pnpm/@hono+zod-openapi@1.6.3_hono@4.13.2_zod@4.6.7/node_modules/@hono/zod-openapi/src/index.ts:602:26)
at async dispatch
(file:///E:/lap_trinh/Project/website/KhangVietDesign/source/node_modules/.pnpm/hono@4.13.2/node_modules/hono/dist/compose.js:22:17)
}
}

[wrangler:info] POST /api/auth/login 500 Internal Server Error (339ms)
