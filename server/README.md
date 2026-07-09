# Ranch Preferred — API

Backend for the Ranch Preferred loyalty app: Node.js + TypeScript + Express + Prisma (SQLite for local dev, swap to Postgres for production by changing `provider`/`DATABASE_URL`).

This phase implements the full API surface with a **simulated Odoo integration** — the sales/customer sync runs against fixture data behind the same interface a real Odoo client would use, so swapping in the real connection later is a small, contained change (see [Odoo integration](#odoo-integration) below).

## Getting started

```bash
npm install
cp .env .env.local   # adjust JWT_SECRET, GOOGLE_CLIENT_ID, etc. if needed — .env already has working dev defaults
npx prisma migrate deploy   # creates prisma/dev.db and applies the schema
npm run seed                # loads stores, rewards, and the demo contractor (Carlos Hernández)
npm run dev                 # starts the API on http://localhost:8787
```

The frontend (`../app`) expects this running at `http://localhost:8787` by default (`VITE_API_URL`).

## Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path (`file:./dev.db`). Point this at a Postgres URL in production. |
| `JWT_SECRET` | Signs app session tokens. **Change this for any real deployment.** |
| `GOOGLE_CLIENT_ID` | Same OAuth client ID as the frontend. Required for `/auth/google` to verify ID tokens server-side. Leave blank to only allow demo login. |
| `CORS_ORIGIN` | Origin allowed to call the API (the frontend's URL). |
| `FRAUD_WEBHOOK_URL` | Optional Slack/Teams-style incoming webhook URL. When set, fraud alerts are also POSTed there in addition to being logged and stored in `FraudAlert`. |

## API surface

All authenticated routes expect `Authorization: Bearer <token>` from `/auth/google` or `/auth/demo`.

- `POST /auth/google` `{ idToken }` → verifies the Google ID token **server-side** (this is the check the frontend intentionally does not do itself) and returns `{ token, contractor }`.
- `POST /auth/demo` → logs in as the seeded demo contractor (Carlos Hernández), same response shape.
- `GET /me` → profile + points + computed tier.
- `GET /points/history` → last 50 point transactions.
- `GET /rewards` → active reward catalog.
- `GET /stores` → the 7 store locations.
- `GET /referrals` / `POST /referrals` → the contractor's referrals.
- `POST /redeem` `{ rewardId }` or `{ customPts }` → generates a signed, single-use QR token and a pending `Redemption`.
- `POST /redeem/confirm` `{ jti }` → deducts points, marks the QR used, runs fraud checks.
- `POST /activate` → generates a purchase-activation QR (15 min TTL).
- `POST /activate/scan` `{ jti, amountUsd }` → simulates the cashier terminal scanning the QR and keying in the sale amount; credits points at the contractor's current tier multiplier.
- `POST /odoo/sync` → manually triggers the Odoo sync job (the same thing the hourly scheduler calls) — useful for demos/tests instead of waiting an hour.

**Important simulation caveat:** `/redeem/confirm` and `/activate/scan` are called by the contractor's own session in this demo so the whole loop is testable without a real point-of-sale integration. In production these must run under a **separate staff/terminal-authenticated context** — a contractor's own phone should never be able to confirm its own redemption or activation. This is called out in code comments at both call sites.

## QR codes and security

- QR codes are generated **client-side** (`qrcode.react` in the frontend) from an opaque value the API returns — no external QR service is used or needed.
- Each QR encodes a random, single-use token (`QrToken.jti`) with a server-tracked expiry (24h for redemptions, matching the "válido 24 horas" copy; 15 min for purchase activation). The token itself carries no meaning — all state lives server-side, so a photographed/screenshotted QR can't be reused or forged.
- Reuse of an already-consumed or expired token is rejected (`409`/`410`) and raises a `HIGH`-severity fraud alert (`qr_replay`) — verified in testing by scanning the same token twice.

## Fraud alerts (`src/fraud/engine.ts`)

Simple, auditable rule checks — not ML, intentionally so the rules are easy to reason about and tune:

- **Redemption velocity**: more than 3 confirmed redemptions per contractor per hour → `HIGH`.
- **Activation velocity**: more than 5 purchase activations per contractor per hour → `MEDIUM`.
- **Large purchase**: a single activated purchase ≥ $5,000 → `MEDIUM`.
- **QR replay / expired QR**: reuse or late use of a token → `HIGH` / `LOW`.

Every alert is written to `FraudAlert` (queryable for a future admin dashboard) and logged to the console; if `FRAUD_WEBHOOK_URL` is set, it's also posted there for real-time staff notification. Thresholds are constants at the top of `engine.ts` — adjust them there as real usage patterns emerge.

## Odoo integration

`src/odoo/mockClient.ts` stands in for a real Odoo connection, behind the exact shape a real client would have:

- `fetchSalesSince(since)` — simulates `sale.order` `search_read`. A real implementation calls Odoo's XML-RPC/JSON-RPC `execute_kw` with `state = 'sale'` and `write_date >= since`.
- `pushCustomer({ name, email })` — simulates upserting `res.partner`. A real implementation calls `execute_kw` with `create`/`write`.

`src/odoo/sync.ts` is what actually runs the sync (contractor upsert, points crediting, `SyncState` cursor) — it only talks to `mockClient`, never to Prisma models Odoo doesn't own. **To connect a real Odoo instance, replace `mockClient.ts` with a real XML-RPC/JSON-RPC client implementing the same two functions — nothing else needs to change.**

`src/odoo/scheduler.ts` runs the sync every hour via `node-cron` (`0 * * * *`). Use `POST /odoo/sync` to trigger it on demand for testing.

## Database

SQLite for local development (`prisma/dev.db`, gitignored). To move to Postgres for production:

1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
2. Set `DATABASE_URL` to your Postgres connection string.
3. Run `npx prisma migrate deploy` against it.

## Security notes for going to production

- Set a strong, secret `JWT_SECRET` (the committed `.env` value is a placeholder for local dev only).
- Restrict `CORS_ORIGIN` to the real frontend origin.
- Put `/odoo/sync` behind an internal/admin credential — it is open in this demo build.
- Gate `/redeem/confirm` and `/activate/scan` behind a staff/terminal session, not the contractor's own token (see caveat above).
- Rate-limit the auth and redeem endpoints (not yet implemented here) in addition to the velocity-based fraud alerts, which currently detect but don't block.
