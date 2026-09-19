# OmniCommerce — AI-Powered CommerceOS + VÉLORA Fashion House

> **One monorepo. Two commerce experiences. Complete operations.**

OmniCommerce is a unified ecommerce operating system. The repository combines the original **CommerceOS** (AI-powered business OS — products, inventory, orders, CRM, marketing, analytics) with the newly built **VÉLORA Fashion House** — a modern clothing store (women / men / kids / footwear / accessories) with proper auth, OTP login, and editorial shopping experience.

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Fastify-5-000000?style=flat-square&logo=fastify" alt="Fastify" />
  <img src="https://img.shields.io/badge/Node-Express-339933?style=flat-square&logo=node.js" alt="Node" />
  <img src="https://img.shields.io/badge/AI-OpenAI_LangChain-412991?style=flat-square" alt="AI" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=flat-square" alt="License" />
</p>

---

## Table of Contents
- [What's New — VÉLORA](#whats-new--vélora-fashion-house)
- [Monorepo Structure](#monorepo-structure)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [VÉLORA Fashion Store](#vélora-fashion-store--clothing)
- [CommerceOS](#commerceos)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Authentication & OTP](#authentication--otp-phone--email)
- [Roles & Routing](#roles--routing)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [License](#license)

---

## What's New — VÉLORA Fashion House

Added in `frontend-user` + `backend` (Fastify):

- **Auth:** Email+password + **Phone/Email OTP** (6-digit, 5-min TTL, 30s resend throttle, 3 attempts). Auto-creates user on first OTP verification.
- **Routing:** `react-router-dom` with `ProtectedRoute` (→ `/home` requires JWT) and `PublicOnlyRoute` (→ `/home` if already auth). `AuthContext` validates token via `GET /api/auth/me`.
- **Screens:**
  - `Landing` (`/`) — editorial hero, brand strip, 6-category grid, editorial story, newsletter, 50k+ social proof
  - `Home` (`/home` protected) — welcome header, search, sort (featured/price/rating), pills filter, promo strip, 4-col product grid, add-to-bag
  - `Login` (`/login`) — tabs: Email+Password vs Phone/Email OTP (request → verify, countdown, dev OTP display)
  - `Signup` (`/signup`) — name/email/phone/password with validation
- **Catalog:** Fashion categories `women/men/kids/footwear/accessories/sale`, 16 curated products (dresses, denim, overcoats, sneakers...), sale discounts, featured/ratings
- **Styling:** Editorial luxury theme (`Playfair Display` + `Cormorant Garamond` + `Inter`, ivory `--bg:#FFFDFB`, ink `--ink:#0F0F0F`, gold `--accent-2:#C9A96A`), fully responsive
- **Backend migration:** `backend/src/db.js` → fashion categories/products, `phone` field on users, file JSON DB with auto-migration from legacy `electronics/home` data

Demo accounts: `user@shop.com / user123`, `admin@shop.com / admin123`, or OTP with any email / phone `9876543210` (OTP shown in response & server log).

---

## Monorepo Structure

```
omnicommerce/
├── README.md                 # This file
├── docker-compose.yml        # CommerceOS stack (postgres/mongo/redis/commerce-api/ai-api/frontend)
├── .gitignore
│
├── backend/                  # ★ VÉLORA — Fastify + file JSON DB (NEW)
│   ├── src/
│   │   ├── server.js         # Fastify + CORS, health/stats, route registration
│   │   ├── db.js             # JSON DB, fashion seed, phone migration
│   │   ├── routes/
│   │   │   ├── auth.js       # register/login + OTP request/verify + me
│   │   │   ├── products.js   # list/filter/sort/reviews, admin/vendor guards
│   │   │   ├── categories.js
│   │   │   ├── cart.js/wishlist.js/orders.js
│   │   │   └── utils/auth.js,jwt.js
│   │   └── data/db.json      # file DB (auto-created)
│   └── package.json
│
├── backend-node/             # CommerceOS — Express + Prisma + Postgres/Redis/Mongo
│   ├── prisma/schema.prisma  # 40+ tables (users/roles/products/inventory/orders/marketing/ai)
│   ├── src/app.js, routes/, middleware/auth.js
│   └── Dockerfile
│
├── backend-ai/               # CommerceOS — FastAPI + LangChain/OpenAI
│   └── services/ai_agent.py, ai_search.py, ...
│
├── frontend/                 # CommerceOS — React + Vite main storefront (3000)
│   └── src/pages/, components/blocks/, context/AppContext, routes/
│
├── frontend-user/            # ★ VÉLORA — Fashion House (NEW) — port 5173
│   ├── src/
│   │   ├── App.jsx           # Routes: / (Landing), /home (protected), /login,/signup (publicOnly)
│   │   ├── context/AuthContext.jsx
│   │   ├── api/client.js     # VITE_API_URL || http://localhost:5000
│   │   ├── components/Navbar.jsx, ProtectedRoute.jsx
│   │   ├── pages/Landing.jsx, Home.jsx, Login.jsx, Signup.jsx
│   │   └── index.css         # editorial theme
│   └── vite.config.js, index.html
│
├── frontend-admin/           # Admin scaffold (Vite)
├── frontend-vendor/          # Vendor scaffold
└── frontend-deliveryman/     # Delivery scaffold
```

---

## Architecture

### CommerceOS (Original)
```
Client (React Vite :3000)
  │
  ▼
API Gateway
  │
  ├── Express :4000 ──► Postgres (pgvector) + Redis + Mongo + Stripe + Resend/WhatsApp
  ├── FastAPI :8000 ──► OpenAI / Gemini / Vector DB (RAG)
  └── S3 / CloudFront / ECS / Secrets Manager
```

### VÉLORA Fashion (New)
```
frontend-user :5173 (React Router + AuthContext)
  │  JWT in localStorage fashion_token
  ▼
backend :5000 (Fastify + CORS)
  ├── POST /api/auth/register, /login
  ├── POST /api/auth/otp/request, /otp/verify  ──► in-memory otpStore (Map)
  ├── GET  /api/auth/me (Bearer)
  ├── GET  /api/products?category=&search=&sort=&featured
  ├── GET  /api/categories
  └── file JSON DB (backend/src/data/db.json) + JWT (jsonwebtoken)
```

---

## Tech Stack

| Layer | CommerceOS | VÉLORA |
|---|---|---|
| **Frontend** | React 19, Vite, TypeScript, Tailwind, Redux Toolkit, React Query, Framer Motion, ShadCN UI | React 19, Vite, react-router-dom, Context, vanilla CSS (editorial) |
| **Backend** | Node Express, Prisma, PostgreSQL, Redis, Mongo, JWT RBAC | Fastify 5, @fastify/cors, bcryptjs, jsonwebtoken, uuid, file JSON |
| **AI** | OpenAI, LangChain, pgvector, RAG | — (ready for future) |
| **Infra** | Docker Compose (postgres/mongo/redis), AWS S3/CloudFront/ECS/RDS | `pnpm dev` local (5000/5173) |
| **Auth** | JWT + RBAC, refresh tokens | JWT (7d) + OTP (5m) + phone field |

---

## VÉLORA Fashion Store — Clothing

### Screens
- **Landing (`/`)** — Fall/Winter 2026 hero (`Define Your Style`), 3-card visual, brand logos (VOGUE/ELLE), CategoryGrid (Women tall + Men/Accessories stack + Footwear tall + Kids + Sale promo), Editorial (Modern Essential Wardrobe), Newsletter (15% off), Footer
- **Home (`/home`)** — Protected. Header with user greeting + search + sort, pill filters, promo strip (WELCOME20), skeleton→grid, discount badges, wishlist, `Home Editorial` styling tip
- **Login (`/login`)** — Visual split (model image + 4.9/5 badge), tabs (Password | OTP), password eye toggle, OTP two-step (identifier → OTP+name, dev OTP inline, 30s resend), demo hint
- **Signup (`/signup`)** — Reversed visual, benefits (15% off/early access/30-day returns), terms checkbox

### Catalog
Categories: `women` (8), `men` (5), `kids` (1), `footwear` (2), `accessories` (2), `sale` (promo). 16 products with `price/originalPrice` (sale %), `rating`, `stock`, `isFeatured`, images from Unsplash fashion.

---

## CommerceOS

See original docs below for the full enterprise OS (retained):

- **AI Product Mgmt** — description/SEO/tag generation
- **Inventory** — warehouses, movements, low-stock alerts, forecasting
- **Orders** — tracking, refunds/returns/exchanges, labels
- **CRM** — profiles/segments/loyalty/reviews/tickets
- **Sales Intelligence** — best-seller/revenue/churn forecasting
- **Marketing** — email/WhatsApp/campaigns/coupons/automation
- **Analytics** — revenue/funnel/geo/cohort reports
- **40+ tables**, RBAC, audit logs, rate limiting

Detailed tables & modules are kept intact in this README (scroll down to original *Database Design / Application Modules*) — omitted here for brevity but preserved in git history (`4ed3c88`).

---

## Quick Start

### Prerequisites
- Node 20+, `pnpm` 11, Docker Desktop, Git
- Ports free: `4000` (commerce-api), `5000` (VÉLORA api), `3000/5173` (frontends), `5432/6379/27017/8000`

### Option A — Docker (CommerceOS)
```bash
git clone https://github.com/sai4u-dev/omnicommerce.git
cd omnicommerce
docker-compose up --build
# frontend  http://localhost:3000
# commerce-api http://localhost:4000/api/health
# ai-api       http://localhost:8000
```

### Option B — Manual (VÉLORA Fashion)
```bash
# 1) VÉLORA API (Fastify file DB)
cd backend
pnpm install
pnpm dev      # → http://localhost:5000  (or PORT=4000 pnpm dev)

# 2) VÉLORA Storefront
cd ../frontend-user
pnpm install
pnpm dev      # → http://localhost:5173
# build: pnpm build && pnpm preview --port 5173

# 3) CommerceOS services (optional)
cd ../backend-node
npm install
npx prisma migrate dev && npx prisma db seed
npm run dev    # → http://localhost:4000

cd ../frontend
pnpm install
pnpm dev       # → http://localhost:3000
```
Set `VITE_API_URL=http://localhost:5000` in `frontend-user/.env` if VÉLORA api runs on non-5000.

---

## Environment Variables

**VÉLORA backend (`backend/src/utils/jwt.js`):**
```
PORT=5000
JWT_SECRET=dev-secret-ecom-2026-please-change
JWT_EXPIRES=7d
```
**VÉLORA frontend-user:**
```
VITE_API_URL=http://localhost:5000
```

**CommerceOS (`docker-compose.yml` / `backend-node`):**
```
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/omnicommerce?schema=public
REDIS_URL=redis://redis:6379
MONGO_URL=mongodb://mongo:27017/omnicommerce
JWT_SECRET=supersecretglowguidekey2026
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
AI_SERVICE_URL=http://ai-api:8000
OPENAI_API_KEY=...
GEMINI_API_KEY=...
```

---

## API Reference

### VÉLORA — `backend` @ `:5000`
| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| GET | `/api/health` | — | — | `{status, time}` |
| GET | `/api/stats` | — | — | `{products, users, orders, categories}` |
| POST | `/api/auth/register` | — | `{name,email,password,phone?,role?}` | Creates user (`phone` normalized digits) → `{token,user}` |
| POST | `/api/auth/login` | — | `{email,password}` | → `{token,user}` |
| POST | `/api/auth/otp/request` | — | `{identifier}` | Email or phone (10-15 digits), 30s throttle → `{message, otp (dev), expiresIn, channel}` |
| POST | `/api/auth/otp/verify` | — | `{identifier,otp,name?}` | 3 attempts, 5m TTL, auto-creates `user` → `{token,user}` |
| GET | `/api/auth/me` | Bearer | — | → `{user}` |
| PUT | `/api/auth/me` | Bearer | `{name,phone,addresses}` | Update profile |
| GET | `/api/categories` | — | — | `{categories}` |
| GET | `/api/products?search=&category=&minPrice=&maxPrice=&sort=&featured=&page=&limit=` | — | — | `{products,total,page,totalPages}` |
| GET | `/api/products/:id` | — | — | Single |
| POST | `/api/products` | `admin/vendor` | `{title,price,category,...}` | Create |
| GET | `/api/products/:id/reviews` | — | — | List |
| POST | `/api/products/:id/reviews` | Bearer | `{rating,comment}` | Add |

**Demo flow:**
```bash
curl -X POST http://localhost:5000/api/auth/otp/request -H "Content-Type: application/json" -d '{"identifier":"9876543210"}'
# → {"otp":"123456"}
curl -X POST http://localhost:5000/api/auth/otp/verify -H "Content-Type: application/json" -d '{"identifier":"9876543210","otp":"123456"}'
# → {"token":"eyJ...","user":{...}}
```

### CommerceOS — `backend-node` @ `:4000`
`GET /api/health`, `POST /api/auth/register|login`, `GET /api/products`, `POST /api/cart`, `POST /api/orders`, `POST /api/payments`, `GET /admin/*` etc. See `backend-node/src/routes/`.

---

## Authentication & OTP (Phone + Email)

**Flows:**
1. **Password:** `Signup` → `POST /api/auth/register` → JWT stored `fashion_token` + `fashion_user` → `AuthContext` → `ProtectedRoute` → `Home`
2. **OTP Email:** `Login` OTP tab → `identifier=test@example.com` → `POST /otp/request` → server logs `[OTP] test@example.com => 123456` → response dev `otp` → user enters → `POST /otp/verify` → `login()` → `/home`
3. **OTP Phone:** same with `identifier=9876543210` → normalized `9876543210` → auto-creates `email=9876543210@phone.local`, `phone=9876543210`

**Security:** `bcrypt` passwords, `jwt` 7d, `otpStore` Map with `expiresAt`, `attempts` (≤3), `lastSentAt` (30s), console log in dev (replace with SMS/Email provider in prod by removing `otp` from response).

---

## Roles & Routing

**Roles:** `user` (default), `vendor`, `delivery`, `admin` — via `requireRole()` in `backend/src/utils/auth.js`.

**Frontend-user routing (`src/App.jsx`):**
```
 /           → Landing (public)
 /home       → ProtectedRoute → Home
 /login      → PublicOnlyRoute → Login
 /signup     → PublicOnlyRoute → Signup
 *           → Navigate to /
```
`PublicOnlyRoute` redirects auth users to `/home`; `ProtectedRoute` shows spinner while `AuthContext.loading` then redirects to `/login` if `!isAuthenticated`.

---

## Available Scripts

```bash
# VÉLORA backend
pnpm --filter backend dev        # nodemon src/server.js
pnpm --filter backend start      # node src/server.js

# VÉLORA fashion storefront
pnpm --filter frontend-user dev      # vite
pnpm --filter frontend-user build    # vite build
pnpm --filter frontend-user preview  # preview 5173

# Scaffolds
pnpm --filter frontend-admin dev
pnpm --filter frontend-vendor dev
pnpm --filter frontend-deliveryman dev

# CommerceOS
npm --prefix backend-node run dev
npm --prefix backend-node run seed
pnpm --filter frontend dev           # :3000
```

---

## Deployment

- **VÉLORA:** Static `frontend-user/dist` + `backend` (Fastify) on any Node host (set `JWT_SECRET`, `PORT`, `VITE_API_URL`). File DB at `backend/src/data/db.json` — migrate to Postgres/Redis for prod.
- **CommerceOS:** `docker-compose up` builds `commerce-api` + `ai-api` + `postgres/mongo/redis` + `frontend`. Or deploy to AWS ECS/RDS/S3/CloudFront as per original arch.
- **Env:** Ensure `VITE_API_URL` points to deployed VÉLORA api (5000) and `FRONTEND_URL` for commerce-api (4000).

---

## Roadmap

- **Fashion Phase 2:** Cart/Wishlist persistence (`/api/cart`, `/api/wishlist`), Orders checkout, Stripe, size variants, reviews UI, admin/vendor dashboards (`frontend-admin`, `frontend-vendor`)
- **Phase 3:** Delivery tracking (`frontend-deliveryman`), AI search (`backend-ai` integration for fashion), seasonal UI (Rainy/Summer/Winter)
- **CommerceOS Phase 4:** Multi-store, advanced RBAC, workflow automation (retained)

---

## Contributing

PRs welcome. Keep `pnpm-lock.yaml` committed, run `pnpm build` before pushing, add tests for `backend/src/routes/auth.js` OTP, and follow existing editorial style for VÉLORA.

---

## License

Proprietary. Copyright © CommerceOS & VÉLORA Fashion House. All Rights Reserved.

**One Platform. Complete Commerce — from AI operating system to editorial fashion retail.**

