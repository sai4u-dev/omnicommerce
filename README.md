# OmniCommerce — VÉLORA Fashion House

> **One monorepo. One backend. Every commerce surface.**
> Single Fastify API `:5000` powers **4 Web apps (Vite) + 3 Expo Mobile apps (Android/iOS) + 2 Electron Desktops** — with shared auth, cart, orders, and real-world e-commerce flows.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Fastify-5-000000?style=flat-square&logo=fastify" alt="Fastify" />
  <img src="https://img.shields.io/badge/Expo-52-000020?style=flat-square&logo=expo" alt="Expo" />
  <img src="https://img.shields.io/badge/Electron-32-47848F?style=flat-square&logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/Node-24-339933?style=flat-square&logo=node.js" alt="Node 24" />
  <img src="https://img.shields.io/badge/pnpm-11-F69220?style=flat-square&logo=pnpm" alt="pnpm" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker" alt="Docker" />
</p>

---

## Table of Contents
- [Features](#features)
- [Architecture — Single Backend, Multiple Apps](#architecture--single-backend-multiple-apps)
- [Monorepo Structure](#monorepo-structure)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference — Single Backend `:5000`](#api-reference--single-backend-5000)
- [Authentication & User Display](#authentication--user-display)
- [E-Commerce Core — Cart, Wishlist, Checkout, Orders, Reviews](#e-commerce-core)
- [Mobile (Expo)](#mobile-notes)
- [Desktop (Electron)](#desktop-notes)
- [Backend Production Hardening](#backend-production-hardening)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

| Area | What’s Built | Roles / Apps |
|---|---|---|
| **Auth — Proper** | Email+Password + Phone/Email OTP (6-digit, 5m TTL, 30s resend, 3 attempts), JWT 7d (`fashion_token`), `GET/PUT /api/auth/me`, `PublicOnlyRoute` blocks `/login` & `/signup` when authenticated, `ProtectedRoute` guards `/home /cart /wishlist /checkout /orders`, Navbar shows **user name + email** in avatar dropdown when logged-in else **Login / Create Account**. Single `AuthContext` with `loading/initialized`, cross-tab sync, `x-app-type`/`x-app-role` headers. | `user` (web+mobile), `admin`, `vendor`, `delivery` — same API |
| **E-Commerce Core** | `Home` → search/sort/filter + **Add to Bag** (`POST /api/cart`) + **Wishlist toggle** (`POST /api/wishlist/:id`) with `♥` state + `View details` → `ProductDetail/:id` (gallery, rating, stock, reviews, qty selector). `Cart` (enriched, qty ±, remove, clear, estimated total → `Checkout`). `Wishlist` grid with remove + add to bag. `Checkout` (address + `COD` / `Stripe mock` / `UPI`, Stripe via `POST /api/payments/stripe/intent|confirm` + `POST /api/orders` decrements stock & clears cart). `Orders` (history, timeline badges `pending→delivered`, cancel pending). Reviews (`POST /api/products/:id/reviews` recalculates avg). Navbar badges `Bag (count)` + `♡ wishlist`. | `frontend-user :5173` + `mobile-user` Expo |
| **Admin** | `Dashboard` (stats + health), `Products` CRUD (vendorId binding), `Orders` (assign `deliveryManId`, status `processing/shipped`), `Users` (admin only). | `frontend-admin :5174` + `desktop-admin` Electron |
| **Vendor** | `Dashboard` (my products preview), `My Products` (create/edit/delete own, stock), `Orders` (fulfill to `processing/shipped`), `Analytics` (revenue, status). | `frontend-vendor :5175` + `mobile-vendor` + `desktop-vendor` |
| **Delivery** | `Deliveries` board (filter `pending..delivered`, `Shipped/Delivered`, `Navigate` via Maps), `Earnings` (`$5/delivery` mock), `Profile`. | `frontend-deliveryman :5176` + `mobile-deliveryman` |
| **Shared** | `@omnicommerce/api-client` (web `localStorage` + mobile `SecureStore` + desktop `preload` → `x-app-type/role`), `@omnicommerce/types`, `@omnicommerce/ui`. | All |
| **Infra** | `pnpm@11 + turbo@2 + Node 24`, `docker-compose` (api + 4 webs + nginx prod + postgres optional), `nginx` reverse proxy, `.github/workflows/ci.yml` (`node 24`, lint/build/docker/expo-doctor). | — |

Demo seed (`backend/src/data/db.json`): `admin@shop.com/admin123`, `vendor@shop.com/vendor123`, `delivery@shop.com/delivery123`, `user@shop.com/user123` / phone `9876543210` (OTP dev visible).

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
                     │  Stripe mock • OTP  │
                     │  File JSON → PG     │
                     └──────────┬──────────┘
                                │  Single API surface
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
    Web (Vite)          Mobile (Expo)            Desktop (Electron)
   ─────────────        ─────────────            ─────────────
   frontend-user        mobile-user              — (user web+mobile)
    :5173 Landing,        Expo Shop+Bag
          Home (search), SecureStore+Cart
          Login/OTP, Wishlist, Checkout
          Product/:id Reviews
          Cart/Wishlist/Orders

   frontend-admin       —                      desktop-admin
    :5174 Dashboard,                        Electron 32
           Products,                        wait-on 5174 → BrowserWindow
           Orders/Users                   file:// dist (prod)

   frontend-vendor      mobile-vendor          desktop-vendor
    :5175 Vendor         Expo                   Electron 32
           Studio,       Add product          wait-on 5175
           Orders        Orders pipeline      Vendor catalog

   frontend-deliveryman mobile-deliveryman     — (delivery web+mobile)
    :5176 Delivery       Expo GPS Navigate
           Board
           Earnings
```

**Contract:** `Authorization: Bearer <JWT>` + `x-app-type: web|mobile|desktop` + `x-app-role: user|admin|vendor|delivery`. Backend logs `appType/appRole`, enforces `requireRole(...)`, health `/api/health|/ready|/live`, `docs` in dev.

---

## Monorepo Structure

```
omnicommerce/
├── backend/                 # Fastify 5 + @fastify/* + file JSON (prod → Postgres)
│   ├── src/server.js        # Helmet, CORS, Rate-limit, Swagger, health, payments, graceful shutdown
│   ├── src/config/env.js   # PORT/HOST/JWT_SECRET (≥32 in prod)/CORS/RATE_LIMIT/DB_PROVIDER/LOG_LEVEL
│   ├── src/db.js            # Fashion seed (women/men/kids/footwear/accessories/sale x16), file JSON + migration
│   ├── src/routes/
│   │   ├── auth.js          # register/login, OTP request/verify (dev OTP leaked, prod hidden), me
│   │   ├── products.js      # list/filter/sort/reviews, admin/vendor guards, vendorId
│   │   ├── cart.js          # GET enriched, POST/PUT/DELETE/clear
│   │   ├── wishlist.js      # GET + POST toggle + DELETE
│   │   ├── orders.js        # POST from cart, GET filtered, PATCH status, POST assign
│   │   ├── payments.js      # POST /payments/stripe/intent|confirm mock + /payments/cod
│   │   └── categories.js
│   ├── src/plugins/security.js # helmet + cors (x-app-*) + rate-limit + sensible
│   ├── src/schemas/common.js   # zod: email/phone/pagination/register/login/otp
│   ├── src/utils/auth.js,jwt.js
│   └── Dockerfile (node:24-alpine builder+runner, healthcheck)

├── packages/
│   ├── api-client/src/index.ts  # createApiClient({baseUrl,appType,appRole,getToken}) + storage adapter
│   ├── types/src/index.ts       # User, Product, Cart, Wishlist, Order, Review…
│   ├── ui/src/components/*      # buttonClasses, card… + useApi hook
│   └── config/                  # shared eslint/ts configs (future)

├── frontend-user/           # VÉLORA User Web :5173
│   ├── src/api/client.js        # VITE_API_URL || :5000, x-app-type:web,x-app-role:user
│   ├── src/context/AuthContext.jsx # 5000 fallback fixed, login/logout, verify /api/auth/me, cross-tab sync
│   ├── src/components/Navbar.jsx, ProtectedRoute.jsx
│   └── src/pages/
│       ├── Landing.jsx, Home.jsx (search/filter + Add to Bag + ♡ wishlist + toast + View details)
│       ├── Login.jsx, Signup.jsx (PublicOnlyRoute, replace navigate)
│       ├── ProductDetail.jsx, Cart.jsx, Wishlist.jsx, Checkout.jsx (Stripe mock + COD/UPI), Orders.jsx
│   └── vite.config.js (5173) + Dockerfile(.prod)

├── frontend-admin/          # Admin Web :5174 — Dashboard, Products, Orders, Users (admin)
├── frontend-vendor/         # Vendor Web :5175 — Dashboard, My Products, Orders, Analytics (vendor)
└── frontend-deliveryman/    # Delivery Web :5176 — Board, Earnings, Profile (delivery)

├── mobile-user/             # Expo 52 — Shop+Bag tabs, SecureStore+AsyncStorage, x-app-type:mobile
├── mobile-vendor/           # Expo — VendorHome (add product) + VendorOrders
├── mobile-deliveryman/      # Expo — DeliveryHome (filter, Shipped/Delivered, Maps Linking)
│   └── each: app.json (com.velora.*), eas.json, src/api/client, src/context/AuthContext, src/navigation/RootNavigator

├── desktop-admin/           # Electron 32 — wait-on 5174 → BrowserWindow (contextIsolation, preload)
│   └── electron/main.js, preload.js (x-app-type:desktop,x-app-role:admin) — file:// dist prod
├── desktop-vendor/          # Electron — wait-on 5175 (vendor)

├── docker-compose.yml       # api + web-* (profiles dev) + nginx prod + postgres optional
├── docker-compose.prod.yml  # prod overlay (restart, limits, VITE_API_URL=https://api.velora.example.com)
├── nginx/nginx.conf         # /api → api:5000 (20r/s, auth 5r/s), / → user, /admin/ /vendor/ /delivery/
├── .env.example, backend/.env.example
├── .github/workflows/ci.yml # node 24 + pnpm 11.7, lint/build/docker/expo-doctor/audit
├── pnpm-workspace.yaml      # allowBuilds: electron/electron-builder/esbuild:true (fix install)
└── turbo.json (dev persistent, build outputs dist/**) + pnpm-workspace.yaml
```

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Web** | React 19, Vite 8, react-router-dom 7, Context, vanilla CSS (editorial: `Playfair Display` + `Cormorant Garamond` + `Inter`, ivory `--bg:#FFFDFB`, ink `--ink:#0F0F0F`, gold `--accent-2:#C9A96A`) |
| **Mobile** | Expo 52, React Native 0.76, `@react-navigation/stack+tabs`, `expo-secure-store` + `AsyncStorage`, `expo-constants` |
| **Desktop** | Electron 32, `electron-store`, `electron-builder` (nsis/dmg/AppImage), `concurrently` + `wait-on` |
| **Backend** | Fastify 5, `@fastify/cors|helmet|rate-limit|sensible|swagger`, `bcryptjs`, `jsonwebtoken`, `uuid`, `zod`, `pino`+`pino-pretty`, `dotenv` |
| **DB** | File JSON `backend/src/data/db.json` (dev, auto-migration) → `DB_PROVIDER=postgres` + `DATABASE_URL` (prod) |
| **Tooling** | `pnpm@11.7` (`Node >=22`, CI `Node 24`), `turbo@2`, `eslint@9`, `husky@9`, `Docker`+`nginx:alpine` |

---

## Quick Start

### Prerequisites
- **Node 24** (CI `actions/setup-node@v4` `node-version:24`; `packageManager: pnpm@11.7` requires `>=22.13` — Node 20 fails with `node:sqlite`), `pnpm@11` (`npm i -g pnpm`), Docker Desktop (optional), Expo Go (mobile), Git
- Ports free: `5000` api, `5173-5176` webs, `19006` Expo

### 1) Clone & Install
```bash
git clone <repo> omnicommerce
cd omnicommerce
pnpm install           # allowBuilds electron:true → electron postinstall runs
```

### 2) Backend — single source of truth
```bash
pnpm --filter backend dev   # → http://localhost:5000  (health /api/health, docs /docs)
# or: cd backend && pnpm dev
# prod: NODE_ENV=production JWT_SECRET=<32+chars> pnpm --filter backend start
```
Check: `curl http://localhost:5000/api/health` → `{status:"ok",env:"development"}`; `curl http://localhost:5000/api/stats`

### 3) Web — 4 role apps
```bash
# all webs + api (desktop excluded by default to avoid port clash)
pnpm dev
# individual
pnpm --filter frontend-user dev        # :5173  user@shop.com / user123
pnpm --filter frontend-admin dev       # :5174  admin@shop.com / admin123
pnpm --filter frontend-vendor dev      # :5175  vendor@shop.com / vendor123
pnpm --filter frontend-deliveryman dev # :5176  delivery@shop.com / delivery123
# all including desktop (needs webs up first)
pnpm dev:all
```
Each supports `VITE_API_URL=http://localhost:5000` override via `.env`.

**Auth UX:** After `Sign In`/`Create Account` → `navigate('/home',{replace:true})` + `login({token,user})` persists `fashion_token`/`fashion_user`. `PublicOnlyRoute` (`loading||!initialized` → spinner, `isAuthenticated` → `Navigate to="/home" replace`) blocks `/login` & `/signup` when logged-in; `ProtectedRoute` guards `/home|/cart|/wishlist|/checkout|/orders` → `Navigate to="/login"`. Navbar: when `isAuthenticated` shows avatar `Ava` + dropdown (`name`, `email`, `phone`, `My Orders/Wishlist/Bag`, `Logout` → `navigate('/',{replace:true})`) + `Bag (count)`/`♡` badges (poll 5s + `cart:updated` events); else shows `Login` + `Create Account`.

### 4) Mobile — Expo
```bash
pnpm --filter mobile-user start        # scan QR Expo Go; a/i for emulator
pnpm --filter mobile-vendor start
pnpm --filter mobile-deliveryman start
# device needs LAN IP, not localhost:
EXPO_PUBLIC_API_URL=http://192.168.1.20:5000 pnpm --filter mobile-user start
```
Token via `expo-secure-store` (primary) + `AsyncStorage` fallback, `x-app-type:mobile`.

### 5) Desktop — Electron
```bash
# requires frontend running; dev only waits then launches window
pnpm --filter desktop-admin dev        # wait-on 5174 → Electron (standalone: dev:standalone)
pnpm --filter desktop-vendor dev       # wait-on 5175
# Build web then installer
pnpm --filter frontend-admin build && pnpm --filter desktop-admin build   # → desktop-admin/release
pnpm --filter frontend-vendor build && pnpm --filter desktop-vendor build
```
Security: `contextIsolation:true, nodeIntegration:false, sandbox:true`, `preload.js` exposes only `electronAPI.getAppInfo()` + `appMeta {type:desktop,role}`.

### 6) Docker — prod single-command
```bash
# dev api only
docker compose up api --build
# dev webs (profiles)
docker compose --profile dev up --build
# prod (nginx 80/443 proxies /api → api:5000, serves dist)
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up --build -d
# curl http://localhost:5000/api/health  +  http://localhost/api/health via nginx
```

---

## Environment Variables

| Var | Where | Default | Notes |
|-----|-------|---------|-------|
| `PORT` | backend | `5000` | |
| `NODE_ENV` | all | `development` | `production` hides OTP (`otp` absent), JSON logs, `JWT_SECRET` must be `≥32` chars |
| `HOST` | backend | `0.0.0.0` | |
| `JWT_SECRET` | backend | `dev-secret...` | **prod throws if default** |
| `JWT_EXPIRES` | backend | `7d` | |
| `CORS_ORIGIN` | backend | `true` (allow all) | Prod: `https://velora.example.com,https://admin.velora.example.com,exp://*` |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW` | backend | `100 / 60000 ms` | `auth/otp` has extra 30s resend `lastSentAt` |
| `DB_PROVIDER` | backend | `file` | `file` → `src/data/db.json` (migrates `phone/addresses`), `postgres` → `DATABASE_URL` |
| `DATABASE_URL` | backend | — | `postgresql://...` when `postgres` |
| `LOG_LEVEL` | backend | `debug` (dev) / `info` (prod) | `pino` + `pino-pretty` in dev |
| `VITE_API_URL` | `frontend-*` | `http://localhost:5000` | Build-time injected |
| `EXPO_PUBLIC_API_URL` | `mobile-*` | `http://localhost:5000` | Use LAN IP for device |
| `ELECTRON_API_URL` / `ELECTRON_START_URL` | `desktop-*` | `http://localhost:5000` / `http://localhost:5174|5175` | `VITE_API_URL` wins in renderer |

Copy `.env.example` → `.env` (never commit). `backend/.env.example` has `PORT/NODE_ENV/JWT_SECRET/CORS_ORIGIN/RATE_LIMIT/DB_PROVIDER/DATABASE_URL/LOG_LEVEL`.

---

## API Reference — Single Backend `:5000`

| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| GET | `/api/health` | — | — | `{status, time, uptime, env}` |
| GET | `/api/ready` | — | — | `db` check |
| GET | `/api/live` | — | — | liveness |
| GET | `/api/stats` | — | — | `products/users/orders/categories` counts |
| GET | `/docs` | — | — | Swagger UI (dev only) |
| POST | `/api/auth/register` | — | `{name,email,password,phone?,role?}` | `role` `user|vendor|delivery`; `admin` not self-register |
| POST | `/api/auth/login` | — | `{email,password}` | → `{token,user}` |
| POST | `/api/auth/otp/request` | — | `{identifier}` email or phone 10-15d | 30s throttle, 5m TTL `otpStore` Map; **OTP only in `message`+`otp` when `!isProd`** |
| POST | `/api/auth/otp/verify` | — | `{identifier,otp,name?}` | 3 attempts, auto-create user (`phone` → `phone.local` email) |
| GET | `/api/auth/me` | Bearer | — | `x-app-type/role` accepted |
| PUT | `/api/auth/me` | Bearer | `{name,phone,addresses}` | |
| GET | `/api/categories` | — | — | 6 fashion cats |
| GET | `/api/products?search=&category=&minPrice=&maxPrice=&sort=&featured=&page=&limit=` | — | — | `sort` `price_asc|price_desc|rating|newest` |
| GET | `/api/products/:id` | — | — | single |
| POST | `/api/products` | `admin|vendor` | `{title,price,category,...}` | `vendorId` auto `req.user.id` for vendor |
| PUT/DELETE | `/api/products/:id` | `admin|vendor` | | vendor only own `vendorId` |
| GET | `/api/products/:id/reviews` | — | — | sorted newest |
| POST | `/api/products/:id/reviews` | Bearer | `{rating 1-5,comment}` | recalculates `product.rating` avg + `reviewsCount` |
| GET | `/api/cart` | Bearer | — | enriched `product`, `{items,total,count}` |
| POST | `/api/cart` | Bearer | `{productId,qty}` | stock check |
| PUT | `/api/cart/:productId` | Bearer | `{qty}` | |
| DELETE | `/api/cart/:productId` | Bearer | — | |
| DELETE | `/api/cart` | Bearer | — | clear |
| GET | `/api/wishlist` | Bearer | — | → `{wishlist: Product[]}` |
| POST | `/api/wishlist/:productId` | Bearer | — | toggle `added|removed` |
| DELETE | `/api/wishlist/:productId` | Bearer | — | |
| POST | `/api/orders` | Bearer | `{shippingAddress{address,city,zip,country,phone},paymentMethod=COD|Stripe|UPI,items?}` | if `items` omitted uses `cart`, decrements `stock`, clears cart |
| GET | `/api/orders` | Bearer | — | `user` own only, `delivery` own+unassigned, `admin|vendor` all |
| GET | `/api/orders/:id` | Bearer | — | 403 if `user` not owner |
| PATCH | `/api/orders/:id/status` | Bearer | `{status:pending|processing|shipped|delivered|cancelled,deliveryManId?}` | `user` only `cancelled` if `pending` |
| POST | `/api/orders/:id/assign` | `admin` | `{deliveryManId}` | validates `role:delivery`, sets `processing` |
| GET | `/api/users` | `admin` | — | sanitized (no `passwordHash`) |
| POST | `/api/payments/stripe/intent` | Bearer | `{amount,currency=inr}` | mock `pi_mock_*` + `clientSecret` |
| POST | `/api/payments/stripe/confirm` | Bearer | `{paymentIntentId,cardLast4}` | `402` if `0000` |
| POST | `/api/payments/cod` | Bearer | — | passthrough |

**Role Matrix:** `user` shop/cart/orders own, `vendor` manage own products + all orders `processing/shipped`, `delivery` assigned+unassigned `shipped/delivered`, `admin` all + assign + users.

---

## Authentication & User Display

**Flows:**
1. **Password:** `Signup` → `POST /api/auth/register` → `login({token,user})` → `localStorage fashion_token/user` → `AuthContext` `isAuthenticated` → `PublicOnlyRoute` → `Navigate to="/home" replace` → `Navbar` shows avatar dropdown (`user.name`, `user.email`, `Bag`/`Orders`) instead of `Login/Signup`.
2. **OTP Email/Phone:** `Login` OTP tab → `identifier=test@example.com|9876543210` → `POST /otp/request` (log `[OTP] id => 123456`) → dev `otp` in response + `setInterval 30s` countdown → `POST /otp/verify` → `login()` → `/home replace`.
3. **Verify on mount:** `AuthContext:15` `useEffect verify()` → `fetch /api/auth/me Bearer` (5000), 401 → `logout()` clears both keys + `auth:logout` event; cross-tab `storage` listener syncs `token/user`.

**Navbar (`frontend-user/src/components/Navbar.jsx:1`):**
* `showAuthActions = !loading && initialized && !isAuthenticated` → `Login` (`/login`) + `Create Account` (`/signup`) + `LANDING/SHOP/COLLECTIONS`.
* `showUserActions = !loading&&initialized&&isAuthenticated` → `Bag (badge count)` + `♡ Wishlist (count)` + `Orders` + **user button** `avatarLetter + displayName` → dropdown `name+email+phone` + `My Orders/Wishlist/Bag (count)` + `Logout` (`logout()` → `navigate('/',{replace:true})`). Prevents flash `…` while `loading`.
* Polls `/api/cart` + `/api/wishlist` `auth:true` every 5s + on `cart:updated|wishlist:updated|auth:login` events.

**Protection:**
* `ProtectedRoute.jsx:4` `loading||!initialized` → `Verifying session...` spinner, else `!isAuthenticated` → `Navigate /login replace state={{from:location}}`.
* `PublicOnlyRoute.jsx:13` `Checking session...` then `isAuthenticated` → `Navigate /home replace` → **cannot visit `/login` or `/signup` when logged-in** (URL direct, back-button, or `Link` all redirect).
* `Login.jsx:19,46` + `Signup.jsx:15` `navigate('/home',{replace:true})` on success.
* Logout clears `fashion_token/user` + `dispatchEvent(auth:logout)` → Navbar counts reset, `isAuthenticated` false → `ProtectedRoute` redirects to `/login`.

---

## E-Commerce Core

**Home (`frontend-user/src/pages/Home.jsx:1`):**
* `GET /api/categories` pills, `GET /api/products?search&category&sort&featured` grid, `filter-pills` `All|women|men|kids|footwear|accessories|sale`, `promo-strip` `WELCOME20`.
* `wishlistIds` `Set` from `GET /api/wishlist`, `addToCart(productId)` → `POST /api/cart` + `dispatchEvent(cart:updated)` + toast, `toggleWishlist` → `POST /api/wishlist/:id` + `Set` update + `wishlist:updated` + toast, `♡` → `♥` (active `background:var(--ink)`), `View details →` + image click → `navigate(/product/:id)`, `Add to Bag` + `View details` per card.

**ProductDetail (`src/pages/ProductDetail.jsx:1`):**
* Gallery `images`, `brand·category`, `★ rating (n reviews)`, `stock`, `Featured`, `₹ price/originalPrice -%`, qty `−/+` (clamped `1..stock`), `Add to Bag — ₹total`, `♡/♥ Wishlist` toggle, `Free shipping/COD/30-day/Secure` badges, `Go to Bag`.
* **Reviews:** `GET /api/products/:id/reviews`, `POST /api/products/:id/reviews {rating,comment}` `auth` → prepend, then `GET /api/products/:id` refresh `rating`/`reviewsCount`. No reviews → `Be the first!`.

**Cart (`src/pages/Cart.jsx:1`):**
* `GET /api/cart` `auth` → `{items:{product,qty},total,count}`, `PUT /api/cart/:id {qty}`, `DELETE /api/cart/:id`, `DELETE /api/cart` clear (confirm), `Estimated Total` + `Free shipping over ₹999`, `Clear Bag` + `Continue Shopping` + `Checkout →`.

**Wishlist (`src/pages/Wishlist.jsx:1`):**
* `GET /api/wishlist`, `POST /api/wishlist/:id` toggle ( `♥` active `var(--ink)`), `Add to Bag` from card, `View details`.

**Checkout (`src/pages/Checkout.jsx:1`):**
* Loads `GET /api/cart` + `GET /api/auth/me` phone prefill, `address {address,city,zip,country,phone}` + `paymentMethod COD|Stripe|UPI` radio cards. Stripe fields `number/exp/cvv` (mock). `placeOrder` → if `Stripe` then `POST /api/payments/stripe/intent {amount:total*100}` → `POST /api/payments/stripe/confirm {paymentIntentId,cardLast4}` (`0000` → throw `card_declined`), then `POST /api/orders {shippingAddress,paymentMethod}` (no `items` → server uses cart). `COD/UPI` direct. `dispatchEvent(cart:updated)` → `Orders` after `1200ms` `navigate('/orders')`. Order summary sticky `total`.

**Orders (`src/pages/Orders.jsx:1`):**
* `GET /api/orders` `auth` → timeline badges `pending(9A3412)/processing(1E40AF)/shipped(0C4A6E)/delivered(065F46)/cancelled(991B1B)`, `PATCH /api/orders/:id/status {status:cancelled}` only `pending`. Shows `id, status, date, paymentMethod, deliveryManId`, `address`, `items` with `image`, `total`.

**Mobile:** `mobile-user/src/screens/CartScreen.js` mirrors `Cart` (qty `-/+`, `Remove`, `Checkout COD` → `POST /api/orders`); `mobile-vendor/src/screens/VendorHome.js` + `VendorOrders.js`; `mobile-deliveryman/src/screens/DeliveryHome.js` (filter, `Shipped/Delivered`, `Linking` Maps).

---

## Mobile Notes

* **Navigation:** `@react-navigation/native-stack` + `bottom-tabs`, `RootNavigator` wraps `AuthProvider`.
* **Auth:** `expo-secure-store` primary + `AsyncStorage` fallback, `GET /api/auth/me` on launch.
* **API:** `src/api/client.js` `x-app-type:mobile` + `x-app-role`, `URLSearchParams`, typed `ApiError`.
* **Builds:** `eas.json` `development|preview|production` (`EXPO_PUBLIC_API_URL=https://api.velora.example.com`), `npx eas build --platform android|ios`, OTA `npx eas update`.
* **Testing:** `EXPO_PUBLIC_API_URL=http://<LAN-IP>:5000`, `CORS_ORIGIN` includes `exp://*`, same Wi-Fi.

---

## Desktop Notes

* **Wrapper:** `desktop-admin` (5174) + `desktop-vendor` (5175) — `electron/main.js` `BrowserWindow 1400x900 hiddenInset`, `wait-on` dev `http://517X` + `openDevTools detach`, prod `file://…/frontend-*/dist/index.html`.
* **Security:** `contextIsolation:true, nodeIntegration:false, sandbox:true`, `preload.js` only `electronAPI.getAppInfo()` + `appMeta {type:desktop,role}`.
* **Headers:** renderer still `x-app-type:desktop`.
* **Build:** `electron-builder` → `release/` `nsis/dmg/AppImage`, `pnpm --filter desktop-admin build` (needs `frontend-admin build` first).

---

## Backend Production Hardening

* **Security:** `@fastify/helmet` (no `CSP`), `@fastify/cors` (`credentials:true`, `x-app-type/x-app-role/x-request-id`), `@fastify/rate-limit` (`100/60s`, `health` allowList, `429` builder), `@fastify/sensible`.
* **Validation:** `zod` `src/schemas/common.js` `validate()` → `400 Validation error` + `details`.
* **Auth:** `bcryptjs` 10 rounds, `jsonwebtoken` 7d, `authPreHandler` `Bearer` + `verifyToken`, `requireRole(...)` 403, OTP `Map expiresAt/attempts≤3/lastSentAt 30s` + `setTimeout` expire, `otp` hidden in `isProd`.
* **Observability:** `pino` (`pino-pretty` dev, JSON prod), `requestIdHeader x-request-id`, `trustProxy:true`, `req.log.error` in `setErrorHandler`, `/api/health|/ready|/live`.
* **Error:** `setNotFoundHandler 404 {path,method}`, `setErrorHandler` `400 validation`, `429`, `500 → Internal server error` in prod + `requestId`.
* **Graceful:** `SIGINT/SIGTERM → app.close()`, `unhandledRejection/caughtException` log + exit.
* **Swagger:** `@fastify/swagger` + `swagger-ui` `/docs` only `isDev`.
* **Domain hint:** `onRequest` `req.appType/req.appRole`.
* **DB:** File JSON `backend/src/data/db.json` auto-migrates `phone/addresses`, `categories` 6, `products` 16-17, `writeDb()` sync.

---

## Scripts

```bash
pnpm dev                # turbo run dev --filter=!desktop-*  (api + 4 webs)
pnpm dev:all            # turbo run dev                       (all 14 inc. desktop)
pnpm dev:backend        # pnpm --filter backend dev           (:5000)
pnpm dev:web:user       # pnpm --filter frontend-user dev -- --port 5173
pnpm dev:web:admin      # pnpm --filter frontend-admin dev -- --port 5174
pnpm dev:web:vendor     # pnpm --filter frontend-vendor dev -- --port 5175
pnpm dev:web:delivery   # pnpm --filter frontend-deliveryman dev -- --port 5176
pnpm dev:mobile:user    # pnpm --filter mobile-user start
pnpm dev:mobile:vendor  # pnpm --filter mobile-vendor start
pnpm dev:mobile:delivery# pnpm --filter mobile-deliveryman start
pnpm dev:desktop:admin  # pnpm --filter desktop-admin dev (wait-on 5174)
pnpm dev:desktop:vendor # pnpm --filter desktop-vendor dev (wait-on 5175)
# standalone desktop (spawns web)
pnpm --filter desktop-admin run dev:standalone

pnpm build              # turbo run build
pnpm build:backend      # pnpm --filter backend build (noop echo)
pnpm build:web          # turbo run build --filter=frontend-* (vite 37 modules → ~313kB 95k gz user)
pnpm lint               # turbo run lint
pnpm test               # turbo run test (backend node --test)
pnpm docker:up          # docker compose up --build
pnpm docker:prod        # docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
pnpm clean              # turbo run clean && rimraf node_modules
```

---

## Deployment

* **Web (Vercel/Netlify):** Build `frontend-*` with `VITE_API_URL=https://api.velora.example.com`, `frontend-user/dist` → user domain, nginx `/admin|/vendor|/delivery` or separate projects.
* **API (Railway/Render/ECS):** `node:24-alpine` `node src/server.js` `NODE_ENV=production JWT_SECRET=32+ CORS_ORIGIN=https://velora.example.com,exp://*`, `DB_PROVIDER=postgres + DATABASE_URL` for scale.
* **Mobile (Expo EAS):** `npx eas build --platform all`, `npx eas update` OTA, `eas.json` prod `EXPO_PUBLIC_API_URL`.
* **Desktop:** `pnpm --filter desktop-admin build` → `release/` (notarize macOS, sign Win, `electron-updater` via S3).
* **Docker Prod:** `docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d` (api `5000` internal, nginx `80/443` `gzip` + `limit_req` `api 20r/s, auth 5r/s`).

---

## Documentation

| Doc | Path | Description |
|-----|------|-------------|
| Overview | `docs/README.md` | Monorepo + features index |
| Architecture | `docs/ARCHITECTURE.md` | Single backend diagram + data flow |
| Authentication | `docs/AUTHENTICATION.md` | OTP + JWT + PublicOnlyRoute + Navbar user menu |
| Backend API | `docs/BACKEND_API.md` | All `routes/` + `x-app-*` + Swagger |
| Frontend Web | `docs/FRONTEND_WEB.md` | 4 webs, Vite, Cart/Wishlist/Checkout flows |
| Mobile | `docs/MOBILE.md` | Expo SecureStore + navigation + EAS |
| Desktop | `docs/DESKTOP.md` | Electron main/preload + wait-on |
| Deployment | `docs/DEPLOYMENT.md` | Docker + nginx + env prod checklist |
| Development | `docs/DEVELOPMENT.md` | `pnpm dev` + ports + troubleshooting |

See `docs/` folder. Root `README.md` is the single-page quick start; `docs/` has per-concern depth.

---

## Troubleshooting

* **Electron failed to install:** `pnpm-workspace.yaml` now `allowBuilds: electron:true` — ensure `pnpm install` shows `electron postinstall$ node install.js Done`. If still `Error: Electron failed to install correctly`, `rm -rf node_modules/.pnpm/electron*` + `rm node_modules/.modules.yaml` + `pnpm install`.
* **Port 5173-5176 in use:** Previous `pnpm dev` still running → `Ctrl+C` + `npx kill-port 5173 5174 5175 5176 5000` or `pnpm dev` will auto-fallback to `5179+` (see logs `Port X is in use, trying another one...`). `pnpm dev` now excludes desktop to avoid duplicate Vite on same port.
* **Node 20 error `node:sqlite` + `pnpm 11.7 requires >=22.13`:** Upgraded to `Node 24` — run `nvm use 24` / `actions/setup-node@v4` `node-version:24`, `pnpm@11.7`, Docker `node:24-alpine`, `package.json engines: >=22`.
* **CORS on device:** Mobile `EXPO_PUBLIC_API_URL` must be LAN IP (`192.168...`), not `localhost`, and `CORS_ORIGIN` must include `exp://*`.
* **OTP not received:** Dev `otp` returned in `POST /api/auth/otp/request` response + server log `[OTP] id => 123456`; prod hides `otp` (use SMS/Email provider).
* **Vite `lockfile has changed` re-optimizing:** Normal after `pnpm install` (esbuild pre-bundle).

---

## Contributing

PRs welcome. Keep `pnpm-lock.yaml` committed, `pnpm --filter frontend-user build` (`vite 37 modules`) before push, add tests for `backend/src/routes/auth.js` OTP, follow editorial CSS.

## License

Proprietary. © CommerceOS & VÉLORA Fashion House — One Platform. Complete Commerce.

