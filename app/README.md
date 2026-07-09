# Ranch Preferred

Loyalty program mobile web app for **The Ranch Fence Supply**. Bilingual (Spanish default / English), installable as a PWA, built with React + TypeScript + Vite, backed by the API in [`../server`](../server).

This implements the design from `Ranch Preferred.dc.html` pixel-for-pixel, rebuilt as a real app (not the design tool's inline HTML/JS), plus:

- A real backend (see [`../server`](../server)): auth, points, redemptions, referrals, an hourly **simulated Odoo sync**, and fraud alerting.
- Real, server-issued, single-use, signed QR codes for "Activar Compra" and reward redemption, instead of the prototype's decorative QR.
- Full bilingual UI (not just the copy deck) with a language switch in **Mi Cuenta**.
- Google Sign-In (Google Identity Services), **verified server-side**, with a demo-account fallback so the app is testable without OAuth credentials configured.
- Installable PWA: manifest, service worker, home-screen icons, and an in-app install prompt.

## What's simulated vs. real

The app talks to a real, working backend — auth, points, redemptions, referrals, and fraud alerts are genuinely persisted and enforced server-side (see `../server/README.md`). The one deliberately simulated piece is **Odoo**: there's no real Odoo instance connected yet, so `../server/src/odoo/mockClient.ts` returns fixture sales/customer data behind the exact interface a real Odoo client would use. Swapping in a real Odoo connection later only touches that one file.

## Getting started

You need both the API (`../server`) and this app running:

```bash
# in ../server (see ../server/README.md for full setup)
npm install && npx prisma migrate deploy && npm run seed && npm run dev   # http://localhost:8787

# in this directory
npm install
cp .env.example .env.local   # VITE_API_URL defaults to http://localhost:8787; fill in VITE_GOOGLE_CLIENT_ID if you have one (optional, see below)
npm run dev
```

Open the printed local URL on your phone (same network) or in a desktop browser at a narrow width — the layout is mobile-first, centered at max 430px.

### Scripts

- `npm run dev` — local dev server with hot reload.
- `npm run build` — type-checks (`tsc -b`) and builds to `dist/`, including the PWA service worker/manifest.
- `npm run preview` — serves the production build locally, useful for testing installability (service workers don't run under `vite dev`).

## Google Sign-In setup

The app uses [Google Identity Services](https://developers.google.com/identity/gsi/web) to get an ID token, then sends it to the backend (`POST /auth/google`), which verifies it against Google's public keys before trusting it — the frontend never trusts a client-side decode of the token. To enable real Google sign-in:

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth client ID** of type **Web application**.
3. Add your dev and production URLs under **Authorized JavaScript origins** (e.g. `http://localhost:5173`, `https://ranchpreferred.vercel.app`).
4. Set the **same** client ID in both places:
   - This app's `.env.local`: `VITE_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com`
   - The server's `.env`: `GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com` (needed for it to verify tokens)
5. Restart both dev servers.

Without a client ID set, the sign-in screen only shows the **"Entrar con cuenta de prueba"** demo button (which also goes through the real backend, just via `/auth/demo` instead of `/auth/google`), so the app stays fully usable for design review and QA.

## Deploying (Vercel)

This is a static Vite build, so Vercel needs no special configuration for the frontend:

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel, **Import Project** → select the repo → set **Root Directory** to `app/` (since the app lives in a subfolder).
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist` (Vercel usually auto-detects these).
4. Add environment variables in the Vercel project settings: `VITE_GOOGLE_CLIENT_ID` (if using real Google Sign-In) and `VITE_API_URL` pointing at wherever `../server` is deployed (Vercel itself works for the API too, as a separate project, or any Node host — see `../server/README.md`).
5. Deploy. Vercel serves over HTTPS by default, which is required for service workers/PWA install and for Google Sign-In.
6. Add the resulting `https://<project>.vercel.app` (and any custom domain) to the OAuth client's **Authorized JavaScript origins** in Google Cloud Console, and to the server's `CORS_ORIGIN`.

### Installing on a phone ("instalarla en sus celulares")

Once deployed on HTTPS, the app is installable straight from the browser — no app store needed:

- **Android (Chrome)**: visiting the site shows an automatic "Install app" banner (also triggered by the in-app install prompt this project ships), or manually via ⋮ menu → **Add to Home screen**.
- **iOS (Safari)**: Safari does not support automatic install prompts. Users tap **Share** → **Add to Home Screen**. The in-app banner detects iOS and shows this instruction instead of a button.
- Once installed, it opens full-screen (no browser chrome), with the app icon, splash/theme color (#111111), and works offline for already-visited screens thanks to the generated service worker.

If a native app-store presence is wanted later (Play Store / App Store), the same codebase can be wrapped with **Trusted Web Activity** (Android) or a thin native shell like **Capacitor** — no rewrite required, since it's already a responsive, installable PWA.

## Project structure

```
src/
  api/             Backend API client (fetch wrapper + typed responses)
  auth/            Google Sign-In + demo auth (AuthContext) — calls the backend, never trusts the client-side token
  i18n/            ES/EN string dictionary + language switch
  state/           App-wide state: fetches /me, points history, rewards, stores, referrals from the API
  data/            What's left as local sample data (tier copy, color swatches, advisor, weekly offer — nothing backend-modeled yet)
  components/      Shared UI: BottomNav, QRCode, Toggle, Sheet, Toast, InstallPrompt
  screens/         One file per tab/screen (Home, Activate, Points, Stores, Account, Refer, modals)
```

## What's still ahead

- **Real Odoo connection** — replace `../server/src/odoo/mockClient.ts` with a real XML-RPC/JSON-RPC client once there's an Odoo instance and credentials to point at (see `../server/README.md#odoo-integration`).
- **Real POS/cashier integration** — right now `/redeem/confirm` and `/activate/scan` are callable by the contractor's own session for demo purposes; production needs these behind a staff/terminal-authenticated context instead (see `../server/README.md`).
- **Notification preferences** are still local-only (not yet backed by a server model) since there's no notification-sending system to wire them to yet.
