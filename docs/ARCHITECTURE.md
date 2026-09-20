# Architecture — Single Backend, Multiple Apps

## Diagram
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
                                │  Single API surface (one OpenAPI)
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
    Web (Vite 19)       Mobile (Expo 52)         Desktop (Electron 32)
   ─────────────        ─────────────            ─────────────
   frontend-user        mobile-user              — (user web+mobile)
    :5173               Expo Shop+Bag            uses web
   frontend-admin       —                      desktop-admin :5174 wait-on
    :5174               —                       → BrowserWindow
   frontend-vendor      mobile-vendor          desktop-vendor :5175 wait-on
    :5175               Expo                    → BrowserWindow
   frontend-deliveryman mobile-deliveryman     — (delivery web+mobile)
    :5176               Expo
```

## Contract
* **Headers:** `Authorization: Bearer <JWT 7d>` + `x-app-type: web|mobile|desktop` + `x-app-role: user|admin|vendor|delivery` + `x-request-id` (generated if missing)
* **Backend hook:** `server.js:73 onRequest` → `req.appType/req.appRole` (logged, for analytics)
* **Health:** `GET /api/health` (uptime+env), `GET /api/ready` (db check), `GET /api/live` (liveness), `GET /api/stats` (counts)
* **Docs:** `GET /docs` Swagger only `env.isDev` (Fastify `@fastify/swagger` + `swagger-ui`)

## Monorepo Packages (`pnpm-workspace.yaml`)

```
packages:
  - backend                 # → omni-api :5000
  - frontend-*              # → frontend-user|admin|vendor|deliveryman (Vite)
  - packages/*              # → api-client|types|ui|config
  - mobile-*                # → mobile-user|vendor|deliveryman (Expo)
  - desktop-*               # → desktop-admin|vendor (Electron)
allowBuilds:
  electron: true            # fixes `Electron failed to install correctly`
  electron-builder: true
  esbuild: true
```

`turbo.json:5` `dev: {cache:false,persistent:true}` → `pnpm dev` (`turbo run dev --filter=!desktop-*`) runs `backend dev (nodemon src/server.js)` + 4 Vite dev servers in parallel; `dev:all` includes desktop (each `wait-on`).

## Data Flow — E-Commerce Core

```
User Web Home (search/filter) → GET /api/products?search=&category=&sort=&featured
  → ♡ Wishlist toggle           → POST /api/wishlist/:id (toggle added|removed)
  → Add to Bag                 → POST /api/cart {productId,qty} (stock check)
Product/:id                    → GET /api/products/:id + GET /api/products/:id/reviews
  → POST /api/products/:id/reviews {rating,comment} → recalculates product.rating
Cart                           → GET /api/cart (enriched product, total,count) → PUT/DELETE
Checkout (address + COD/Stripe/UPI) → POST /api/payments/stripe/intent → POST /api/payments/stripe/confirm (mock) → POST /api/orders {shippingAddress,paymentMethod} (server uses cart, decrements stock, clears cart)
Orders                         → GET /api/orders (user own, delivery own+unassigned, admin/vendor all) → PATCH /api/orders/:id/status (user only cancelled if pending)
```

Admin `POST /api/orders/:id/assign {deliveryManId}` validates `role:delivery`.

## Backend `backend/src/`

* `server.js:14` Fastify `logger pino` (`pino-pretty` dev, JSON prod), `trustProxy:true`, `requestIdHeader`, `registerSecurity` (helmet/cors/rate-limit/sensible), Swagger dev, health/stats, `register(auth|products|categories|cart|wishlist|orders|payments)`, `onRequest` domain hint, `setNotFoundHandler` + `setErrorHandler` (400 validation, 429, 500 prod sanitize + `requestId`), `SIGINT/SIGTERM` graceful.
* `config/env.js:1` `PORT/HOST/JWT_SECRET (≥32 in prod)/JWT_EXPIRES/CORS_ORIGIN (comma list)/RATE_LIMIT_MAX/WINDOW/DB_PROVIDER/DATABASE_URL/LOG_LEVEL` + `validateEnv()` throws if default `JWT_SECRET` in prod.
* `db.js:1` `defaultCategories[6] + defaultProducts[16]` (fashion), `createFreshDb()` seeds `users[admin|vendor|delivery|user] + bcrypt 10`, `ensureDb()` migrates `phone/addresses`, `categories/products` if old `electronics` slug, `writeDb()` sync file `src/data/db.json`.
* `plugins/security.js:1` `helmet:{csp:false}`, `cors:{origin:env.CORS_ORIGIN, credentials:true, allowedHeaders: Content-Type+Authorization+x-app-*+x-request-id}`, `rate-limit {max, timeWindow, allowList health/ready, 429 builder}`.
* `schemas/common.js:1` `zod` `emailSchema/phoneSchema/paginationSchema/registerSchema/loginSchema/otpRequest/verify` + `validate(schema,data)` → `statusCode 400`.
* `utils/jwt.js:1` `signToken(payload, env.JWT_SECRET, expiresIn)` + `verifyToken`.

## Frontend `frontend-user/src/`

* `api/client.js:1` `API = VITE_API_URL || :5000`, `getToken() fashion_token`, `apiFetch(path,{method,body,auth,headers,params})` → `fetch(API+path)` with `Content-Type + x-app-type:web + x-app-role:user` + `Authorization Bearer` if `auth`, JSON parse + `ApiError status`.
* `context/AuthContext.jsx:1` `TOKEN_KEY fashion_token, USER_KEY fashion_user`, `login({token,user})` + `logout()` + `verify()` `fetch /api/auth/me Bearer` (5000, not 4000) → `setUser` or `logout()`, `storage` event sync, `isAuthenticated`.
* `components/Navbar.jsx:1` + `ProtectedRoute.jsx:1` (see `AUTHENTICATION.md`).

## Shared `packages/`

* `api-client/src/index.ts:1` `createApiClient({baseUrl,appType,appRole,getToken,onUnauthorized})` → `request/get/post/put/patch/del` + domain `auth/products/categories/cart/wishlist/orders/users/health/stats` — web `localStorage`, mobile `SecureStore+AsyncStorage` via `storage.ts`, desktop `window.electronAPI`.
* `types/src/index.ts:1` `Role, User, Category, Product, CartItem, Cart, Wishlist, OrderItem, Order, Review, PaginatedProducts, AuthTokens`.
* `ui/src/*:1` `buttonClasses, cardClasses, badgeClasses, useApi` hook.

## Mobile `mobile-*` + Desktop `desktop-*`

* Expo: `app.json` `com.velora.user|vendor|delivery`, `extra.apiUrl`, `plugins expo-secure-store`, `src/api/client.js` `API Constants.expoConfig.extra.apiUrl || EXPO_PUBLIC_API_URL`, `TOKEN_KEY velora_*_token`, `SecureStore+AsyncStorage`, `x-app-type:mobile`.
* Electron: `electron/main.js:1` `BrowserWindow 1400x900 hiddenInset`, `wait-on` dev `http://5174|5175` + `openDevTools detach`, prod `file://…/frontend-*/dist/index.html`, `preload.js:1` `contextBridge expose electronAPI + appMeta`.

See `../README.md` for monorepo tree and `BACKEND_API.md` for routes.
