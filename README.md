# Hulu Service

Local services marketplace for Ethiopia — connects customers with verified providers
(electricians, plumbers, satellite/DSTV installers, tutors, and more).

## Media kit

[Hulu Service — LinkedIn Carousel (PDF)](./docs/Hulu_Service_LinkedIn_Carousel.pdf)

## What's built so far

**Backend (Go + Gin + MongoDB)**
- User model shared by customers and providers (role field), providers also carry `workAreas` (e.g. Bole, Piassa)
- 15 Ethiopian service categories + 18 Addis Ababa work areas seeded/available (`/api/categories`, `/api/areas`)
- JWT auth with role-based middleware (`RequireAuth`, `RequireRole`)
- `/api/auth/register`, `/api/auth/login` — providers register with categories + work areas
- `/api/providers` — public listing for customers, **phone numbers included directly**, filterable by category/area/availability
- `PATCH /api/provider/availability` — instant available/not-available toggle, no approval step
- Booking + Review models scaffolded, ready for handlers next — **no expiry/time limit** on accept or reject by design

**Mobile (Expo/React Native + TypeScript)**
- **Amharic-only** — all UI text, categories, and areas are in Amharic; light/dark toggle remains in the top bar
- Register screen: customer/provider role picker, provider category picker, **provider work-area picker** (Bole, Piassa, Kazanchis, etc.)
- Provider dashboard: **LinkedIn-style "open to work" banner** — tap to flip available ⇄ not available, syncs to backend instantly
- Customer home: **GPS location auto-detected** on load (no manual address typing), tappable category grid
- Provider list screen (opened by tapping a category): shows each provider's **phone number directly** (tap to call), work-area badges, live availability dot, and rating

## Running the backend

```bash
cd backend
cp .env.example .env    # edit MONGO_URI / JWT_SECRET as needed
go mod tidy
go run cmd/seed/main.go   # one-time: seeds the 15 service categories
go run main.go
```

Backend runs on `http://localhost:8080`.

## Running the mobile app

```bash
cd mobile
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` in a `.env` file (or `app.config.js` extra) to point at your
backend, e.g. `http://192.168.x.x:8080/api` for a physical device, or your Render URL
once deployed — same pattern as Yova. Location permission prompt text is set in `app.json`.

## Next steps (in build order)

1. Booking handlers (create, accept/reject — no time limit, provider can respond whenever) + customer/provider booking screens
2. "New requests" feed wired into the provider dashboard card
3. In-app chat (reuse the WebSocket hub pattern from Pedal Delivery)
4. Reviews + rating aggregation on provider profiles
5. Provider verification flow (ID upload, admin approval) in the admin panel
6. Payment integration (Telebirr / CBE Birr)
