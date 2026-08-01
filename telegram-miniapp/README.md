# Hulu Service — Telegram Mini App

A real web UI (React) that opens inside Telegram as a Mini App, launched
from the bot's menu button — like the "Open Mini-App" button you saw on
Ocu-Care. This is the main interface; the Telegram bot (`../telegram-bot`)
still works standalone and can stay around as a lightweight notifications
channel, but this is where people will actually browse, book, and chat.

It talks to your existing Go backend directly (same `/api/...` endpoints
the mobile app and bot use) — nothing on the backend needed to change,
since `cors.Default()` is already enabled in `main.go`.

## Local development

```bash
npm install
cp .env.example .env
```
Edit `.env` — `VITE_BACKEND_URL` should point at your backend (default
assumes it's running locally on `:8080`).

```bash
npm run dev
```
This starts a dev server on `http://localhost:5173`. Opening that in a
normal browser tab works fine for building/checking the UI — but **Telegram
itself will refuse to open it** as a Mini App until it's served over HTTPS.
That's what the next section is for.

## Testing inside real Telegram (ngrok)

Telegram Mini Apps must be `https://`, and won't load `localhost` or
`http://` URLs at all. The fastest way to get a real HTTPS URL for local
testing is [ngrok](https://ngrok.com) (free tier is enough).

1. **Install ngrok** and sign up (needed once, for the auth token):
   https://ngrok.com/download

2. **Tunnel the mini app**, in a new terminal (leave `npm run dev` running):
   ```bash
   ngrok http 5173
   ```
   Copy the `https://....ngrok-free.app` URL it prints.

3. **Tunnel the backend too**, if it's also only running locally — Telegram's
   WebView needs to reach both the mini app *and* the API it calls, and
   neither can be `localhost` from inside Telegram's app:
   ```bash
   ngrok http 8080
   ```
   Copy that URL as well.

4. **Point the mini app at the tunneled backend.** Edit `.env`:
   ```
   VITE_BACKEND_URL=https://<your-backend-ngrok-url>/api
   ```
   Restart `npm run dev` (Vite only reads `.env` at startup).

5. **Point the bot at the tunneled mini app.** In `../telegram-bot/.env`:
   ```
   MINIAPP_URL=https://<your-miniapp-ngrok-url>
   ```
   Restart the bot (`npm run dev` in `telegram-bot/`).

6. Open your bot in Telegram, send `/start`, and tap **📱 መተግበሪያውን ክፈት** —
   or use the persistent menu button next to the message box.

Free ngrok URLs change every time you restart it, so you'll repeat steps
2-5 each dev session. That's expected and fine for testing.

## Deploying for real

Once you're happy with it:

1. **Build**: `npm run build` produces static files in `dist/` — this is
   just HTML/CSS/JS, so it can be hosted anywhere that serves static files.
   Easiest options: [Vercel](https://vercel.com) or
   [Netlify](https://netlify.com) — both have free tiers, connect to a
   GitHub repo, and give you a permanent `https://` URL automatically (no
   ngrok needed, and the URL stays stable across restarts).
2. Set `VITE_BACKEND_URL` in that host's environment variables to your
   **real, permanently-hosted backend URL** (your Go backend needs to be
   deployed somewhere reachable too — e.g. a small VPS, Railway, Fly.io —
   ngrok is for local testing only, not production).
3. Update `MINIAPP_URL` in the bot's `.env` to the permanent deployed URL.

## What's implemented

Same coverage as the bot: login/register (with the provider category +
work-area picker), browse categories, see matching providers, create a
booking, track "My Bookings" with cancel, provider dashboard (availability
toggle, accept/decline, mark complete), and a chat screen per booking.

## Known limitations

- **Chat is polling** (every 4s), not push — same tradeoff as the bot, for
  the same reason (your backend's WebSocket chat endpoint would need a
  small client here to go real-time; a good next step).
- **Provider availability starts as "unknown" on load** — there's no
  "get my own profile" endpoint yet to fetch the current state, so the
  toggle just flips from whatever it last was in this session. Worth adding
  a small `GET /provider/me` endpoint if this matters to you.
- **Session persists in `localStorage`** on the device — fine for a real
  deployed site (this isn't a sandboxed preview), but means logging out
  needs to be explicit (the Profile page's "ውጣ" button).

## Project layout

```
src/
  main.tsx              entry point, mounts <App/> + Telegram SDK init
  App.tsx                 routes + auth guard
  lib/
    api.ts                 backend API client (mirrors the bot's)
    auth.tsx               login/register/logout, persisted session
    telegram.ts            Telegram WebApp SDK bridge (theme sync)
  components/
    ui.tsx                  Button, Card, StatusBadge, TopBar, EmptyState
    BottomNav.tsx           bottom tab bar
    BrandMark.tsx           the flower mark (signature design element)
  pages/
    Login.tsx, Register.tsx
    Home.tsx                category grid
    Providers.tsx           providers for a category
    BookNew.tsx             booking form
    MyBookings.tsx          customer's bookings
    ProviderDashboard.tsx   provider's job queue + availability
    Chat.tsx                per-booking chat
    Profile.tsx
```
