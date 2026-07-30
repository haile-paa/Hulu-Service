# Hulu Service — Admin Console

A React + TypeScript + Tailwind CSS v4 admin dashboard for Hulu Service, talking to the **same backend** as the mobile app.

## Features

- **Dashboard** — total users/customers/providers, how many providers are available right now, verified providers, total bookings, revenue from completed jobs, a 7-day activity trend chart, a booking-status breakdown, and a "most requested work types" chart.
- **Bookings** — every booking in the system, searchable by customer/provider name, filterable by status, paginated.
- **Providers** — every registered provider, with their services & prices, rating, verify/unverify, and suspend/restore.
- **Users** — all accounts (customers & providers), searchable, filterable by role, suspend/restore.
- **Work Types & Prices** — this is where prices actually live. Add a new work type, edit an existing one's price (one-time / monthly / negotiable), or delete one. Every provider registered under a category picks up its price automatically — providers never set their own price.

## Setup

```bash
cd admin
npm install
cp .env.example .env   # then edit VITE_API_URL to point at your backend
npm run dev
```

Open http://localhost:5175.

> **Note on Windows:** `vite` and `@vitejs/plugin-react` are pinned to stable versions (5.x / 4.x) in `package.json`, not the newer Vite 8 / rolldown-based toolchain — that combo has a known npm bug on Windows where the platform-specific native binding fails to install (`Cannot find native binding`). If you ever bump these packages and hit that error again, delete `node_modules` + `package-lock.json` and run `npm install` fresh, or pin back to `vite@^5` / `@vitejs/plugin-react@^4`.

## Logging in

The backend's seed script (`backend/cmd/seed/main.go`) creates a default admin account the first time it runs:

- Phone: `0900000000` (or your `ADMIN_PHONE` env var)
- Password: `admin123` (or your `ADMIN_PASSWORD` env var)

**Change this password after your first login** — there's no in-app "change password" screen yet, so for now that means updating the `password_hash` field directly in MongoDB for that admin user (hash it with bcrypt) or re-running the seed script with different `ADMIN_PHONE`/`ADMIN_PASSWORD` env vars against a fresh database.

## Build for production

```bash
npm run build
```

Output goes to `dist/` — serve it with any static host (Nginx, Vercel, Netlify, etc.) and make sure `VITE_API_URL` was set correctly at build time.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · React Router · Axios · Framer Motion (animations) · Recharts (charts) · React Three Fiber + drei (3D background) · lucide-react (icons)
