# Frontend Web — 4 Vite Apps (User + Admin + Vendor + Delivery)

> `React 19 + Vite 8 + react-router-dom 7 + Context` (no Redux), editorial theme `Playfair Display + Cormorant Garamond + Inter`, ivory `FFFDFB`.

## Apps & Roles

* **User** `frontend-user :5173` — Landing (public), Home Shop (protected, search/filter → Add to Bag + ♡ + View details), ProductDetail `/:id`, Cart, Wishlist, Checkout (Stripe mock), Orders, Login/Signup (PublicOnlyRoute). `role:user` (also `vendor|delivery` can login but Shop filters same).
* **Admin** `frontend-admin :5174` — `Sidebar` `Dashboard/Products/Orders/Users`, `AuthContext admin_token/admin_user` `requireRole admin`, `Dashboard` stats `products/users/orders/categories` + health `uptime`, `Products` `POST/DELETE` + vendorId binding, `Orders` `PATCH status` + `POST assign {deliveryManId}`, `Users` `GET /api/users` table.
* **Vendor** `frontend-vendor :5175` — `Sidebar` `Dashboard/My Products/Orders/Analytics`, `vendor_token/user`, `Products` create/edit/delete own (`vendorId`), `Orders` `processing/shipped`, `Analytics` revenue `total` + `avgOrder` + `Low Stock` + `Orders by Status` badges.
* **Delivery** `frontend-deliveryman :5176` — `Deliveries` assigned+unassigned filter `all|pending|...`, `Shipped/Delivered` + `Navigate` Maps, `Earnings ($5/delivery)` + `Profile` `PUT /api/auth/me phone`.

## Shared Patterns

* **Routing:** `frontend-user/src/App.jsx:13` `Routes` `"/" Landing`" `"/home" ProtectedRoute<Home>` `"/product/:id" ProductDetail` `"/cart|/wishlist|/checkout|/orders" ProtectedRoute` `"/login|/signup" PublicOnlyRoute` `* → /`.
* **Auth:** `src/context/AuthContext.jsx:1` `TOKEN_KEY fashion_token (+ admin_token/vendor_token/delivery_token)`, `verify()` `fetch /api/auth/me Bearer + x-app-*` (5000), `login({token,user})` `localStorage` + `dispatchEvent(auth:login)`, `logout()` clears + `navigate('/',replace)`, `loading/initialized` spinners `Verifying/Checking session`, `storage` sync, `isAuthenticated`.
* **Protected:** `components/ProtectedRoute.jsx:1` `loading||!initialized` spinner else `!isAuthenticated → Navigate /login replace state={{from}}`; `PublicOnlyRoute` `isAuthenticated → Navigate /home replace`.
* **API:** `src/api/client.js:1` `API = VITE_API_URL||5000`, `getToken()`, `apiFetch(path,{method,body,auth,headers,params})` → `fetch` with `x-app-type:web + x-app-role` + `Authorization`, JSON + `ApiError status`.
* **Navbar:** `src/components/Navbar.jsx:1` `isAuthenticated? Bag/Wishlist/Orders + avatar dropdown (name/email/phone) : Login/Create Account`, `cartCount/wishCount` poll `5s` + `cart:updated` events, `menuRef` outside-click/Esc, `displayName` + `avatarLetter`, `Logout` replace.
* **Home:** `src/pages/Home.jsx:1` `wishlistIds Set` from `GET /api/wishlist`, `addToCart`/`toggleWishlist` dispatch events + toast `top 70`, `♡→♥` active `var(--ink)`.
* **Auth Pages:** `Login.jsx:19,46` `mode password|otp`, `form` + `otpForm` + `countdown 30s`, `handlePasswordLogin`/`verifyOtp` → `login(data)` → `navigate('/home',{replace:true})`; `Signup.jsx:15` `name/email/phone/password≥6/confirm + terms` → `register {role default user}`.

## Theme (`src/index.css:1`)

`@import Inter+Playfair+Cormorant`, `:root --bg:#FFFDFB --bg-soft:#F7F3EF --ink:#0F0F0F --muted:#6B6B6B --line:#E8E0D8 --accent-2:#C9A96A --radius:16 --shadow`, `* box-sizing`, `navbar sticky backdrop-blur`, `auth-page grid 1.05fr .95fr` + `auth-visual` overlay, `btn` `btn-dark|outline|ghost` `999px`, `product-grid 4col → 3→2→1` responsive, `sidebar 260w sticky` admin/vendor/delivery, `card bordered 16px`, `badge pending(FFF7ED) processing(EFF6FF) shipped(F0F9FF) delivered(ECFDF3) cancelled(FEF2F2)`, `spinner border 3px`.

## Build & Run

* `pnpm --filter frontend-user dev -- --port 5173` (or `pnpm dev` turbo `dev --filter=!desktop-*` runs all 4 webs + api)
* `pnpm --filter frontend-user build` → `vite 37 modules → 317kB (95k gz)` `dist/index.html + assets`
* `VITE_API_URL=http://localhost:5000` in `.env` (dev `true` allow all, prod comma list).

## E-Commerce Core Pages (User)

See `ECOMMERCE_CORE.md`: `Home → ProductDetail → Cart → Checkout (Stripe mock) → Orders`, `Wishlist`, `Orders` cancel pending, `Reviews` recalc.

## Admin/Vendor/Delivery Details

* **Admin:** `src/pages/Dashboard.jsx:1` `GET /api/stats + /api/health + GET /api/orders auth` → `stats-grid 4`, `Recent Orders` table `id.slice(0,8)`.
* **Vendor:** `src/pages/Products.jsx:1` `POST /api/products auth` `vendorId` auto, `PUT` own, `DELETE` 403 if not owner; `Orders.jsx` `PATCH status`; `Analytics.jsx` `revenue/avgOrder/Low Stock`.
* **Delivery:** `src/pages/Dashboard.jsx:1` `filter all|pending|...`, `Shipped/Delivered` + `Linking` Google Maps `search?query=address city`.

See `../README.md#quick-start` for `pnpm dev` ports + demo accounts.
