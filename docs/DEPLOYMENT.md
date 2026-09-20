# Deployment — Docker + nginx + Vercel/Railway + Expo EAS + Electron Builder

> `Node 24` (`pnpm 11.7` needs `>=22.13` `node:sqlite`), `allowBuilds electron:true`.

## Docker — Single Command

**Dev (api only):**
```bash
docker compose up api --build    # :5000 health /api/health
```
**Dev webs (profiles):**
```bash
docker compose --profile dev up --build # api + frontend-user 5173 + admin 5174 + vendor 5175 + delivery 5176 (each Dockerfile node:24)
```
**Prod (api + nginx 80/443):**
```bash
# build webs prod (VITE_API_URL prod) or let nginx volume serve dist
pnpm build:web  # turbo build frontend-* vite 37 modules
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up --build -d
# nginx:80 proxies /api → api:5000 (20r/s), /auth 5r/s, serves / → user dist, /admin/ /vendor/ /delivery/
curl http://localhost/api/health        # via nginx
curl http://localhost:5000/api/health  # direct
```
`docker-compose.yml:1` `services api (node:24-alpine builder+runner, healthcheck node -e fetch, volume ./backend/src/data:/app/src/data, env PORT/HOST/JWT_SECRET/CORS_ORIGIN/RATE_LIMIT/DB_PROVIDER/LOG_LEVEL)`, `web-*` (`build Dockerfile`, `ports 5173-5176`, `depends_on api healthy`, `profiles dev`), `postgres pgvector:pg16 (profiles postgres)`, `nginx nginx:alpine (profiles prod, volumes nginx.conf:ro + frontend-*/dist:ro)`. `docker-compose.prod.yml:1` `api NODE_ENV=production LOG_LEVEL=info restart always resources limits 1cpu 512M`, `web-* Dockerfile.prod VITE_API_URL=https://api.velora.example.com`, `nginx restart always`.

**Nginx `nginx/nginx.conf:1`:**
```
upstream api { server api:5000 }
limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s
server { listen 80; add_header X-Frame-Options SAMEORIGIN ...; location /api/ { limit_req api burst 40 nodelay; proxy_pass http://api; proxy_set_header Host X-Real-IP X-Forwarded-For ... X-Request-Id X-App-Type X-App-Role; OPTIONS → 204 CORS } location ~ ^/api/auth/(login|register|otp) { limit_req auth } location /docs { proxy_pass } location / { root /usr/share/nginx/html/user; try_files $uri /index.html; cache js/css 1y immutable } location /admin/ { alias /usr/share/nginx/html/admin/; try_files $uri /admin/index.html } ... /vendor/ /delivery/ }
```
`Dockerfile` (`backend/frontend-*`): `FROM node:24-alpine AS builder (corepack pnpm@11.7, pnpm install --frozen-lockfile, pnpm build with ARG VITE_API_URL), FROM nginx:alpine AS runner COPY dist + nginx.conf`.

## Web — Vercel/Netlify

* **Build:** `pnpm --filter frontend-user build` `VITE_API_URL=https://api.velora.example.com` (similar for admin/vendor/delivery). `dist/index.html 0.72k + assets 17k css + 313-317k js (95k gz)`.
* **Vercel:** 4 projects `frontend-user|admin|vendor|deliveryman` each `Build Command pnpm --filter frontend-* build`, `Output dist`, `Env VITE_API_URL`, or single nginx routing `//admin|/vendor|/delivery` via `vercel.json` rewrites.
* **Env:** `VITE_API_URL` build-time, `CORS_ORIGIN https://velora.example.com,https://admin.velora.example.com,exp://*`.

## API — Railway/Render/ECS

* **Image:** `backend/Dockerfile node:24-alpine` `node src/server.js` `PORT 5000` `HOST 0.0.0.0` `ENV NODE_ENV=production` `JWT_SECRET=<32+ random> JWT_EXPIRES=7d CORS_ORIGIN=https://velora.example.com,exp://* RATE_LIMIT_MAX=100 LOG_LEVEL=info DB_PROVIDER=file|postgres DATABASE_URL=postgresql://...` `HEALTHCHECK 30s node -e fetch(/api/health)`.
* **Scaling:** File JSON → `DB_PROVIDER=postgres` + `DATABASE_URL` (migrate `db.js` to Prisma `schema.prisma` 40+ tables). Add `REDIS_URL` for OTP `otpStore` + rate-limit, `S3_BUCKET + CLOUDFRONT` for images, `STRIPE_SECRET_KEY`.
* **Check:** `GET /api/ready` db check, `GET /api/live` liveness (k8s probes).

## Mobile — Expo EAS

* **Config:** `mobile-*/app.json` `expo.name VÉLORA — User|Vendor|Delivery, slug, bundleIdentifier com.velora.*, scheme velora-* , extra.apiUrl, eas.projectId`, `eas.json` `cli ≥13, build development preview production (EXPO_PUBLIC_API_URL=https://api.velora.example.com, autoIncrement)`.
* **Build:**
```bash
npx eas login
npx eas build --platform android --profile preview   # apk internal
npx eas build --platform all --profile production    # aab/ipa
npx eas update --branch production --message "fix"
```
* **OTA:** `expo-updates`, `npx eas update`.
* **Device:** `EXPO_PUBLIC_API_URL=http://<LAN-IP>:5000` (not `localhost`), `CORS_ORIGIN` `exp://*`, same Wi-Fi.

## Desktop — Electron Builder

* **Build:** `pnpm --filter frontend-admin build && pnpm --filter desktop-admin build` → `desktop-admin/release` `VÉLORA Admin Setup ...exe|dmg|AppImage` (`nsis|dmg|AppImage`).
* **Sign:** macOS notarize (`APPLE_ID`), Windows `CSC_LINK` cert.
* **Auto-update:** `electron-updater` + `S3` (`release` → `s3://velora-desktop`), `main.js` `autoUpdater.checkForUpdatesAndNotify()`.

## Prod Env Checklist

```
NODE_ENV=production
PORT=5000 HOST=0.0.0.0
JWT_SECRET=<openssl rand -hex 32> (≥32, not dev-secret)
JWT_EXPIRES=7d
CORS_ORIGIN=https://velora.example.com,https://admin.velora.example.com,exp://*
RATE_LIMIT_MAX=100 RATE_LIMIT_WINDOW=60000
DB_PROVIDER=postgres DATABASE_URL=postgresql://postgres:***@postgres:5432/omnicommerce
LOG_LEVEL=info
VITE_API_URL=https://api.velora.example.com
EXPO_PUBLIC_API_URL=https://api.velora.example.com
ELECTRON_API_URL=https://api.velora.example.com
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=... (future AI)
```

## CI — ` .github/workflows/ci.yml:1`

`name CI — OmniCommerce, on push main|develop + PR main, jobs lint-and-test (checkout@v4 + pnpm/action-setup@v4 11.7 + setup-node@v4 node-version:24 cache pnpm, pnpm install --frozen-lockfile, pnpm lint, pnpm -r --filter frontend-* build, pnpm --filter backend test NODE_ENV=test), docker (setup-buildx, build-push api), expo-preview (setup 24, expo-doctor), security (pnpm audit)`. Node 24 fixes `node:sqlite` `ERR_UNKNOWN_BUILTIN_MODULE`.

See `../README.md#deployment` + `ARCHITECTURE.md`.
