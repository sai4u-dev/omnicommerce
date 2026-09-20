# Development — Local, Ports, Troubleshooting, CI

## Requirements

* `Node 24` (`nvm use 24` or `fnm`), `pnpm 11.7` (`npm i -g pnpm@11.7`, `packageManager pnpm@11.7`, `engines node>=22` — Node 20 fails `node:sqlite` `ERR_UNKNOWN_BUILTIN_MODULE`), `Docker Desktop` + `Git`, `Expo Go` (mobile), `husky 9` (optional).

## Install

```bash
git clone <repo> omnicommerce
cd omnicommerce
pnpm install           # allowBuilds electron:true → electron postinstall Done (Node 24)
# if `Electron failed to install correctly`: rm -rf node_modules/.pnpm/electron* && rm node_modules/.modules.yaml && pnpm install (pnpm-workspace.yaml allowBuilds: electron:true)
```

## Run — `pnpm dev` Family

| Command | What it runs | Ports |
|---------|--------------|-------|
| `pnpm dev` | `turbo run dev --filter=!desktop-*` → `backend dev (nodemon)` + `frontend-user 5173` + `admin 5174` + `vendor 5175` + `deliveryman 5176` | `5000, 5173-5176` |
| `pnpm dev:all` | `turbo run dev` (14 inc. desktop) | + Electron windows |
| `pnpm --filter backend dev` | `nodemon src/server.js` | `5000` (`/health /docs`) |
| `pnpm --filter frontend-user dev -- --port 5173` | Vite | `5173` |
| `pnpm --filter mobile-user start` | Expo Metro | `19006` + QR |
| `pnpm --filter desktop-admin dev` | `wait-on 5174 && electron .` (needs `frontend-admin` up) | `5174` → Electron |
| `pnpm --filter desktop-admin run dev:standalone` | `concurrently vite 5174 + wait-on + electron` (port may shift to `5177` if `pnpm dev` already occupies `5174`) | `5177` |

`turbo.json:5 dev: {cache:false,persistent:true}` → `turbo run dev` parallels persistent tasks (deprecated `--parallel` → `turbo run dev`).

## Ports & URLs

* `http://localhost:5000/api/health` `ok` `uptime` `env development` + `GET /api/stats` + `GET /api/products` + `http://localhost:5000/docs` Swagger
* `http://localhost:5173` User (Landing ` /`, Shop `/home` protected, `/product/:id`, `/cart|/wishlist|/checkout|/orders`, `/login|/signup` PublicOnly), `5174` Admin (`admin@shop.com/admin123`), `5175` Vendor (`vendor@shop.com/vendor123`), `5176` Delivery (`delivery@shop.com/delivery123` + `9876543210` OTP dev)
* `exp://` Expo Go `EXPO_PUBLIC_API_URL=http://<LAN-IP>:5000` (not `localhost` on device)

## Auth Testing

```bash
# login
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"user@shop.com","password":"user123"}' # → {token,user}
# OTP
curl -X POST http://localhost:5000/api/auth/otp/request -H "Content-Type: application/json" -d '{"identifier":"9876543210"}' # → {otp} dev only
# me
curl http://localhost:5000/api/auth/me -H "Authorization: Bearer <token>"
# cart
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"user@shop.com","password":"user123"}' | jq -r .token)
curl http://localhost:5000/api/cart -H "Authorization: Bearer $TOKEN"
```

## Build & Lint

```bash
pnpm --filter frontend-user build   # vite 37 modules → 313-317kB (95k gz) dist/
pnpm build:web                      # turbo build frontend-*
pnpm lint                           # turbo run lint (eslint 9)
pnpm --filter backend test          # node --test src/**/*.test.js (add OTP tests)
pnpm clean                          # turbo clean && rimraf node_modules
```

## Docker

```bash
docker compose up api --build
docker compose --profile dev up --build # api + webs
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up --build -d # nginx 80
docker compose config --profile dev | grep container_name
```

## Troubleshooting

* **Electron `Error: Electron failed to install correctly`** → `pnpm-workspace.yaml:8 allowBuilds: electron:true` fixed; run `pnpm install` → `electron postinstall$ node install.js Done` (Node 24). If still: `rm -rf node_modules/.pnpm/electron@* desktop-*/node_modules/electron` + `rm node_modules/.modules.yaml` + `pnpm install`.
* **Port 5173-5176/5000 in use** → `pnpm dev` already running; kill `Ctrl+C` or `npx kill-port 5173 5174 5175 5176 5000` or let Vite fallback to `5177+` (`Port X is in use, trying another one...`). `pnpm dev` now `--filter=!desktop-*` avoids duplicate Vite (desktop `dev` is wait-only; `dev:standalone` spawns own Vite).
* **Node 20 `node:sqlite` `ERR_UNKNOWN_BUILTIN_MODULE` + `pnpm 11.7 requires >=22.13`** → upgrade to `Node 24` (`actions/setup-node@v4 node-version:24`, `Dockerfile node:24-alpine`, `engines >=22`).
* **CORS on Expo device** → `EXPO_PUBLIC_API_URL=http://192.168.x.x:5000`, `CORS_ORIGIN` includes `exp://*`, same Wi-Fi.
* **Login redirects loop** → check `frontend-user/src/context/AuthContext.jsx:1` `API = VITE_API_URL||5000` (was `4000` bug fixed), `PublicOnlyRoute` `isAuthenticated→Navigate /home replace`; `ProtectedRoute` `!isAuthenticated→Navigate /login`.
* **Navbar shows Login when should show user** → ensure `fashion_token` in `localStorage`, `AuthContext` `isAuthenticated` true, `Navbar` `showUserActions = !loading&&initialized&&isAuthenticated` → avatar dropdown; `showAuthActions` → `Login/Create Account`.
* **Vite `lockfile has changed` re-optimizing** → normal after `pnpm install`.

## CI — ` .github/workflows/ci.yml:1`

`lint-and-test` `checkout@v4 + pnpm/action-setup@v4 11.7 + setup-node@v4 24 cache pnpm` → `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm -r --filter frontend-* build`, `pnpm --filter backend test`; `docker` `setup-buildx` + `build-push api`; `expo-preview` `setup-node 24` + `expo-doctor`; `security` `pnpm audit`. Node 24 fixes `node:sqlite`.

See `../README.md` for `pnpm dev` ports + demo accounts.
