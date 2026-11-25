---
name: verify-khangviet
description: "Run end-to-end runtime verification across KhangViet public and admin routes using docs/feature-map.md and scripts/verify-app.mjs. Apply before claiming UI, API, or auth work is complete."
---

# Verify KhangViet

Proves the real app (`apps/web` + `apps/api` + local D1) works end-to-end with zero console errors and zero unexpected `/api/*` 4xx/5xx responses.

## Steps

1. Ensure the static export is built if testing via Wrangler (`pnpm --filter web build`), or point `--url http://127.0.0.1:3000` at a running `next dev` + `wrangler dev` pair.
2. Run:
   ```powershell
   pnpm verify
   ```
3. Inspect `.verify-artifacts/*.png` screenshots for any route touched by your change.
4. Report the exact route pass/fail counts and any console/API errors observed. Never claim done if any Feature Map route fails.
