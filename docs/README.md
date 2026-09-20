# Docs — OmniCommerce Index

Welcome to **OmniCommerce — VÉLORA Fashion House** technical docs. Single Fastify `:5000` backend, monorepo `pnpm@11 + turbo` + `Node 24`.

## Quick Links
* **Root Quick Start:** `../README.md` (single-page, badges, `pnpm dev`, API table)
* **Architecture:** `ARCHITECTURE.md` — diagram, single backend contract, data flow, monorepo packages
* **Authentication & User Display:** `AUTHENTICATION.md` — OTP + JWT, `PublicOnlyRoute`, Navbar avatar dropdown
* **E-Commerce Core:** `ECOMMERCE_CORE.md` — Cart, Wishlist, ProductDetail + Reviews, Checkout (Stripe mock), Orders
* **Backend API:** `BACKEND_API.md` — all `backend/src/routes/*`, `x-app-*`, Swagger, error model
* **Frontend Web:** `FRONTEND_WEB.md` — 4 Vite apps, routing, `AuthContext`, `api/client`, editorial theme
* **Mobile (Expo):** `MOBILE.md` — 3 apps, `SecureStore`, navigation, `EXPO_PUBLIC_API_URL`, EAS
* **Desktop (Electron):** `DESKTOP.md` — 2 wrappers, `main.js`/`preload.js`, `wait-on`, `electron-builder`
* **Deployment:** `DEPLOYMENT.md` — Docker + `docker-compose.prod.yml` + `nginx` + prod env checklist
* **Development:** `DEVELOPMENT.md` — local dev (`pnpm dev` vs `dev:all`), ports, troubleshooting, CI `node 24`

## Monorepo At-a-Glance
```
backend/ (Fastify :5000) + packages/api-client|types|ui
frontend-user :5173 (Cart/Wishlist/Checkout/Orders/Product/:id) + frontend-admin :5174 + frontend-vendor :5175 + frontend-deliveryman :5176
mobile-user|vendor|deliveryman (Expo 52, SecureStore)
desktop-admin|vendor (Electron 32, wait-on)
docker-compose.yml + nginx/nginx.conf + .github/workflows/ci.yml (node 24)
```

## Key Decisions Till Now
* **Single backend, multiple apps:** One `backend` serves web, Expo, Electron via `Authorization Bearer` + `x-app-type`/`x-app-role` (+ `x-request-id`).
* **Auth — Proper:** `AuthContext` fixed `API 5000` fallback (was `4000`), `loading/initialized` guards, `PublicOnlyRoute` blocks `/login|/signup` when authenticated, `Navbar` shows `Bag/Wishlist/Orders` + avatar dropdown (`name/email/phone` + `Logout`) else `Login/Create Account`; `replace` navigation prevents back-button login.
* **E-Commerce Core:** `Cart` enriched + qty, `Wishlist` toggle, `ProductDetail` gallery + reviews recalc, `Checkout` `COD/Stripe mock/UPI` → `POST /api/payments/stripe/intent|confirm` → `POST /api/orders` (stock decrement, clear cart), `Orders` timeline + cancel pending.
* **Production Hardening:** `Node 24` (pnpm 11 needs `node:sqlite` ≥22.13), `allowBuilds electron:true`, `turbo dev --filter=!desktop-*` to avoid port clash, `helmet/cors/rate-limit/pino` + `zod` + `graceful`.

## Where to Go Next
* **For API integration:** `BACKEND_API.md` + `http://localhost:5000/docs` (Swagger in dev)
* **For Web UI:** `FRONTEND_WEB.md` + `frontend-user/src/pages/*`
* **For Mobile builds:** `MOBILE.md` (`EXPO_PUBLIC_API_URL` LAN IP)
* **For Desktop installers:** `DESKTOP.md` (`pnpm --filter desktop-admin build`)
* **For Prod deploy:** `DEPLOYMENT.md` (Docker prod, nginx, env)

All docs are versioned with code — `README.md` is the source of truth for demo accounts (`admin@shop.com/admin123` etc.) + `pnpm dev` ports.
