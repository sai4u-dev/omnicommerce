# OmniCommerce — Single Backend, Multiple Apps

> **One monorepo. One backend. Web + Expo Mobile (Android/iOS) + Electron Desktop.**
> Fashion + CommerceOS unified on Fastify :5000. All frontends ship from same API with `x-app-type` / `x-app-role`.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Fastify](https://img.shields.io/badge/Fastify-5-000000?style=flat-square&logo=fastify)
![Expo](https://img.shields.io/badge/Expo-52-000020?style=flat-square&logo=expo)
![Electron](https://img.shields.io/badge/Electron-32-47848F?style=flat-square&logo=electron)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

---

## Architecture — Single Backend, Multiple Apps

```
                    ┌─────────────────────┐
                    │   Backend (Fastify) │
                    │      :5000          │
                    │  JWT RBAC • Helmet  │
                    │  CORS x-app-type    │
                    │  Rate-limit • Zod   │
                    │  Swagger /docs      │
                    │  File JSON → PG     │
                    └──────────┬──────────┘
                               │  Single API surface
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   Web (Vite)          Mobile (Expo)            Desktop (Electron)
  ─────────────        ─────────────            ─────────────
  frontend-user        mobile-user              — (user is web+mobile)
   :5173   Landing,    Expo Android/iOS
           Home, Login  SecureStore, Cart
           OTP, Cart

  frontend-admin       —                      desktop-admin
   :5174 Dashboard,                        Electron 32
          Products,                        BrowserWindow
          Orders, Users                    file:// + http://5174

  frontend-vendor      mobile-vendor          desktop-vendor
   :5175 Vendor         Expo                   Electron
          Studio,                       Vendor catalog mgmt
          Orders, Analytics

  frontend-deliveryman mobile-deliveryman     — (delivery web+mobile)
   :5176 Delivery       Expo
          Board,                        GPS, navigate, delivered
          Earnings
```

**Contract:**
- `Authorization: Bearer <JWT>` + `x-app-type: web|mobile|desktop` + `x-app-role: user|admin|vendor|delivery`
- Backend logs `appType/appRole`, enforces `requireRole(...)`, exposes `/api/health`, `/api/ready`, `/api/live`, `/docs` (dev).

---

## Monorepo Structure

```
omnicommerce/
├── backend/                 # Fastify 5 + @fastify/* + file JSON DB (prod → Postgres)
│   ├── src/server.js        # Helmet, CORS, Rate-limit, Swagger, Health, Graceful shutdown
│   ├── src/config/env.js   # Zod-like validation, JWT_SECRET check in prod
│   ├── src/db.js            # Fashion categories/products seed, file DB with migration
│   ├── src/routes/*         # auth (OTP), products, categories, cart, wishlist, orders
│   ├── src/plugins/security.js
│   └── Dockerfile
│
├── packages/
│   ├── api-client/          # Universal client: web localStorage, mobile SecureStore, desktop preload
│   │   └── src/index.ts     # createApiClient({baseUrl, appType, appRole, getToken})
│   ├── types/               # Shared TS types: User, Product, Order, Cart…
│   └── ui/                  # Shared UI tokens (buttonClasses, card…)

├── frontend-user/           # VÉLORA Fashion — User Web :5173
│   └── src/pages/Landing, Home, Login, Signup, api/client (+ x-app headers)
├── frontend-admin/          # Admin Web :5174 — Dashboard, Products, Orders, Users (role: admin)
├── frontend-vendor/         # Vendor Web :5175 — Studio, My Products, Orders, Analytics (role: vendor)
└── frontend-deliveryman/    # Delivery Web :5176 — Board, Earnings, Profile (role: delivery)

├── mobile-user/             # Expo 52 — Shop + Bag tabs, OTP, SecureStore
├── mobile-vendor/           # Expo — Add product, Orders pipeline
├── mobile-deliveryman/      # Expo — Deliveries list, Shipped/Delivered, Navigate (expo-linking)
│   └── each: app.json, eas.json, src/api/client (SecureStore + AsyncStorage), src/navigation

├── desktop-admin/           # Electron 32 — loads frontend-admin (5174 dev, file:// prod)
│   └── electron/main.js (BrowserWindow, contextIsolation, menu), preload.js (x-app-type: desktop)
├── desktop-vendor/          # Electron — loads frontend-vendor

├── docker-compose.yml       # api + web-* (dev profiles) + nginx (prod) + postgres (optional)
├── docker-compose.prod.yml  # prod overlay (restart, resource limits, prod VITE_API_URL)
├── nginx/nginx.conf         # Reverse proxy: /api → api:5000, / → user, /admin/, /vendor/, /delivery/
├── .env.example / backend/.env.example
├── .github/workflows/ci.yml # lint, build, docker, expo-doctor, audit
└── turbo.json + pnpm-workspace.yaml
```

---

## Quick Start — Single Backend, Many Frontends

### Prerequisites
Node 20+, pnpm 11, Docker Desktop (optional), Expo Go app (mobile), Git

### 1) Backend — single source of truth

```bash
cd backend
pnpm install
pnpm dev      # → http://localhost:5000  (health: /api/health, docs: /docs in dev)
# prod: NODE_ENV=production JWT_SECRET=<32+chars> pnpm start
```

### 2) Web (Vite) — four role apps

```bash
# User (5173) — fashion store
pnpm --filter frontend-user dev
# Admin (5174) — console (admin@shop.com / admin123)
pnpm --filter frontend-admin dev
# Vendor (5175) — studio (vendor@shop.com / vendor123)
pnpm --filter frontend-vendor dev
# Delivery (5176) — board (delivery@shop.com / delivery123)
pnpm --filter frontend-deliveryman dev

# or all at once
pnpm dev   # turbo run dev --parallel (api + 4 webs)
```

Set `VITE_API_URL=http://localhost:5000` in each `frontend-*/.env` if API non-standard.

### 3) Mobile — Expo (Android/iOS)

```bash
# User
pnpm --filter mobile-user start
# scan QR with Expo Go; or press a/i for android/ios emulator

# Vendor & Delivery similarly
pnpm --filter mobile-vendor start
pnpm --filter mobile-deliveryman start

# Config: set EXPO_PUBLIC_API_URL=http://<your-lan-ip>:5000  (not localhost on device)
# Example: EXPO_PUBLIC_API_URL=http://192.168.1.20:5000 pnpm --filter mobile-user start
```

*Storage:* token via `expo-secure-store` (primary) + `AsyncStorage` (fallback). `x-app-type: mobile` sent every request.

### 4) Desktop — Electron

```bash
# Admin desktop wraps frontend-admin (5174)
pnpm --filter desktop-admin dev
# requires frontend-admin running on 5174; electron loads DEV_URL or file:// dist in prod

# Vendor desktop wraps frontend-vendor (5175)
pnpm --filter desktop-vendor dev

# Build installers:
pnpm --filter desktop-admin build   # → desktop-admin/release (nsis/dmg/AppImage)
pnpm --filter desktop-vendor build
# Also need web built first: pnpm --filter frontend-admin build
```

*Security:* `contextIsolation:true, nodeIntegration:false, sandbox:true`. Preload exposes only `electronAPI.getAppInfo()` + `appMeta {type: desktop, role}`. All http goes through `x-app-type: desktop`.

### 5) Docker — production single-command

```bash
# Dev (api + optionally webs)
docker compose --profile dev up --build
# or just api
docker compose up api --build

# Prod (api + nginx serving built webs, proxy /api)
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up --build -d
# Frontend builds must have run for nginx volumes: pnpm build:web  or docker build uses Dockerfile.prod

# Check
curl http://localhost:5000/api/health
curl http://localhost:5000/api/stats
```

---

## Environment Variables

| Var | Where | Default | Notes |
|-----|-------|---------|-------|
| `PORT` | backend | 5000 | |
| `NODE_ENV` | all | development | `production` hides OTP in response, enables prod logging |
| `JWT_SECRET` | backend | dev-secret… | **≥32 chars in prod, throws if default** |
| `JWT_EXPIRES` | backend | 7d | |
| `CORS_ORIGIN` | backend | `true` (allow all) | Prod: comma list `https://app.example.com,exp://*` |
| `RATE_LIMIT_MAX` / `WINDOW` | backend | 100 / 60000 ms | /api/auth/otp has 30s resend throttle separate |
| `DB_PROVIDER` | backend | file | file → `src/data/db.json` (dev), postgres (prod) |
| `DATABASE_URL` | backend | — | When `DB_PROVIDER=postgres` |
| `VITE_API_URL` | frontend-* | http://localhost:5000 | Injected at build time |
| `EXPO_PUBLIC_API_URL` | mobile-* | http://localhost:5000 | Use LAN IP for device |
| `ELECTRON_API_URL` | desktop-* | http://localhost:5000 | Overridden by `VITE_API_URL` in renderer |

---

## API Reference — Single Backend (`:5000`)

| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| GET | `/api/health` | — | — | `{status, time, uptime, env}` |
| GET | `/api/ready` | — | — | checks db |
| GET | `/api/live` | — | — | liveness |
| GET | `/api/stats` | — | — | counts |
| GET | `/docs` | — | — | Swagger (dev) |
| POST | `/api/auth/register` | — | `{name,email,password,phone?,role?}` | role=user/vendor/delivery (admin not self-register) |
| POST | `/api/auth/login` | — | `{email,password}` | |
| POST | `/api/auth/otp/request` | — | `{identifier}` | 30s throttle, 5m TTL; **OTP only returned in dev** |
| POST | `/api/auth/otp/verify` | — | `{identifier,otp,name?}` | auto-creates user if missing |
| GET | `/api/auth/me` | Bearer | — | |
| PUT | `/api/auth/me` | Bearer | `{name,phone,addresses}` | |
| GET | `/api/categories` | — | — | |
| GET | `/api/products?...` | — | — | `search,category,minPrice,maxPrice,sort,featured,page,limit` |
| GET/POST/PUT/DELETE | `/api/products/:id` | admin/vendor | | `vendorId` binding enforced |
| GET/POST | `/api/products/:id/reviews` | — / Bearer | | |
| GET/POST/PUT/DELETE | `/api/cart` … | Bearer | | enriched with product |
| GET/POST | `/api/wishlist` … | Bearer | | |
| POST/GET | `/api/orders` | Bearer | `{shippingAddress,paymentMethod,items?}` | clear cart, decrement stock |
| GET | `/api/orders/:id` | Bearer | | |
| PATCH | `/api/orders/:id/status` | Bearer | `{status,deliveryManId?}` | `user` can only cancel pending |
| POST | `/api/orders/:id/assign` | admin | `{deliveryManId}` | |
| GET | `/api/users` | admin | | |

**Role matrix:**
- `user` → shop, cart, orders (own only)
- `vendor` → manage own products, see all orders, update to processing/shipped
- `delivery` → sees unassigned + own assigned, update to shipped/delivered
- `admin` → full CRUD, assign delivery, manage users

Demo accounts seeded in `backend/src/data/db.json` on first run: `admin@shop.com/admin123`, `vendor@shop.com/vendor123`, `delivery@shop.com/delivery123`, `user@shop.com/user123` (+ phone `9876543210`).

---

## Mobile Notes (Expo + React Native)

- **Navigation:** `@react-navigation/native-stack` + `bottom-tabs`. `RootNavigator` wraps auth state, shows Tabs (Home/Bag for user; Products/Orders for vendor; Deliveries for delivery).
- **Auth:** `expo-secure-store` holds JWT; `AsyncStorage` mirrors for quick reads. `AuthContext` validates via `GET /api/auth/me` on launch. `login`/`logout` clear both stores.
- **API:** `src/api/client.js` sends `x-app-type: mobile` + `x-app-role`. `apiFetch` handles URLSearchParams for filters, auto-parses JSON, throws typed error.
- **Builds:** `eas.json` has `development/preview/production` profiles. Production `EXPO_PUBLIC_API_URL=https://api.velora.example.com`. Run `npx eas build --platform android` / `ios`.
- **Permissions:** Delivery mobile adds `expo-location` + `expo-notifications` (stubs for now; link to navigate via `Linking` to Google Maps).
- **Testing on device:** Must set `EXPO_PUBLIC_API_URL` to LAN IP (`10.0.0.x`), ensure backend CORS includes `exp://*`, and device & laptop on same Wi-Fi.

---

## Desktop Notes (Electron)

- **Why Electron:** Admins/vendors want native window, offline-cache, auto-updater, file system. Vendor desktop + Admin desktop are separate `desktop-*` workspaces, each wrapping its web build.
- **Main:** `electron/main.js` creates `BrowserWindow 1400x900`, loads `DEV_URL (http://localhost:517X)` in dev with DevTools, or `file://…/frontend-*/dist/index.html` in prod. `autoHideMenuBar`, `hiddenInset`, `backgroundColor #FFFDFB`.
- **Security:** `contextIsolation:true`, `nodeIntegration:false`, `sandbox:true`, `preload.js` exposes only `electronAPI.getAppInfo()` + `appMeta`. External links via `shell.openExternal`.
- **Headers:** Renderer still sends `x-app-type: desktop`, `x-app-role: admin|vendor` via `api/client.js` (shared with web but picks up `window.appMeta` if present).
- **Packaging:** `electron-builder` → `release/` (nsis for Win, dmg for Mac, AppImage for Linux). `pnpm --filter desktop-admin build` first builds web `frontend-admin` then electron.
- **Updates:** stubbed `autoUpdater` can be added (electron-updater + S3/CloudFront).

---

## Backend Production Hardening (Already Done)

- **Security:** `@fastify/helmet`, `@fastify/cors` (exposes `x-request-id`, allows `x-app-*`), `@fastify/rate-limit` (429 builder), `@fastify/sensible`.
- **Validation:** `zod` schemas in `src/schemas/common.js` (email, phone, pagination, register/login/otp). `validate()` throws 400 with details.
- **Auth:** `bcryptjs` (10 rounds), `jsonwebtoken` 7d, `authPreHandler` + `requireRole(...)`. OTP: `Map` with `expiresAt`, `attempts ≤3`, `lastSentAt` 30s, `setTimeout` auto-expire; **OTP removed from response in prod** (`env.isProd`).
- **Observability:** `pino` + `pino-pretty` in dev, JSON in prod, `requestIdHeader: x-request-id`, `trustProxy:true`, structured `req.log.error` in `setErrorHandler`. Health: `/api/health`, `/api/ready` (checks db), `/api/live`.
- **Error handling:** `setNotFoundHandler`, `setErrorHandler` (validation → 400, 429, prod 500→ “Internal server error”, includes `requestId`).
- **Graceful:** `SIGINT/SIGTERM` → `app.close()`, `unhandledRejection`/`uncaughtException` logging, `app.listen({port, host})`.
- **Swagger:** `@fastify/swagger` + `@fastify/swagger-ui` at `/docs` only in `isDev`.
- **Domain hint:** `onRequest` hook exposes `req.appType / req.appRole` for analytics.
- **DB:** File JSON with auto-migration from legacy `electronics/home` data; ensures `phone/addresses`; `writeDb()` sync. Prod switch to Postgres via `DB_PROVIDER=postgres` (future Prisma layer).

---

## Scripts — Root

```bash
pnpm dev                # turbo run dev --parallel (all)
pnpm dev:backend        # pnpm --filter backend dev
pnpm dev:web:user       # pnpm --filter frontend-user dev -- --port 5173
pnpm dev:web:admin      # pnpm --filter frontend-admin dev -- --port 5174
pnpm dev:web:vendor     # pnpm --filter frontend-vendor dev -- --port 5175
pnpm dev:web:delivery   # pnpm --filter frontend-deliveryman dev -- --port 5176
pnpm dev:mobile:user    # pnpm --filter mobile-user start
pnpm dev:mobile:vendor  # pnpm --filter mobile-vendor start
pnpm dev:mobile:delivery# pnpm --filter mobile-deliveryman start
pnpm dev:desktop:admin  # pnpm --filter desktop-admin dev
pnpm dev:desktop:vendor # pnpm --filter desktop-vendor dev

pnpm build              # turbo run build
pnpm build:backend      # pnpm --filter backend build (noop)
pnpm build:web          # turbo run build --filter=frontend-*
pnpm lint               # turbo run lint
pnpm test               # turbo run test
pnpm docker:up          # docker compose up --build
pnpm docker:prod        # docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

---

## Deployment

- **Vercel/Netlify (Web):** Build each `frontend-*` with `VITE_API_URL=https://api.velora.example.com`. `frontend-user/dist` → user domain, `/admin/*` etc via nginx routing above or separate projects.
- **API (Railway/Render/ECS):** `backend` `node src/server.js` with `NODE_ENV=production`, `JWT_SECRET` (32+), `CORS_ORIGIN=https://velora.example.com,https://admin.velora.example.com,exp://*`. File DB works but set `DB_PROVIDER=postgres` + `DATABASE_URL` for scale (migrate `db.js` to Prisma).
- **Mobile (Expo EAS):** `npx eas build --platform all` with `eas.json` profiles; OTA via `npx eas update`.
- **Desktop (Electron Builder):** `pnpm --filter desktop-admin build` artifacts in `release/`; notarize for macOS, sign for Windows; auto-updater via S3.
- **Docker Prod:** `docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d` (nginx on 80/443, api on 5000 internal).

---

## Roadmap

- Web: Cart persistence, Wishlist UI, Checkout (Stripe), size variants, reviews UI, admin/vendor analytics charts
- Mobile: Push (expo-notifications), live location (expo-location) for delivery, barcode scanner for inventory, offline cart via `expo-sqlite`
- Desktop: Offline queue, print labels (electron print), auto-updater (electron-updater + S3)
- Backend: Postgres + Prisma for orders, Redis for OTP/rate-limit, S3 for images, WebSocket for order status

---

## Contributing

PRs welcome. Keep `pnpm-lock.yaml` committed, run `pnpm build` before pushing, add tests for `auth.js` OTP, and follow editorial style for VÉLORA.

## License

Proprietary. © CommerceOS & VÉLORA Fashion House.
