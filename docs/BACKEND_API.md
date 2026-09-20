# Backend API — Single Backend `:5000` (Fastify)

Base: `http://localhost:5000` (`VITE_API_URL`, `EXPO_PUBLIC_API_URL`, `ELECTRON_API_URL`) + `http://localhost:5000/docs` Swagger (dev only).

Headers for all: `Content-Type: application/json`, `x-app-type: web|mobile|desktop`, `x-app-role: user|admin|vendor|delivery`, `Authorization: Bearer <JWT>` when `auth`, `x-request-id` (auto-generated if missing).

DB: File JSON `backend/src/data/db.json` (16 fashion products, 6 cats, seed users), `db.js` `getDb()/writeDb()` + migration `phone/addresses`.

## Health & Meta

* `GET /api/health` → `{status:"ok", time, uptime, env}`
* `GET /api/ready` → `{status:"ready", checks:{db:"ok",products,users}}` or `503 not ready`
* `GET /api/live` → `{status:"alive"}`
* `GET /api/stats` → `{products,users,orders,categories}`
* `GET /docs` → Swagger UI (openapi `title OmniCommerce API, servers http://localhost:5000, securitySchemes bearerAuth`)

## Auth

| Method | Path | Auth | Body | Resp |
|--------|------|------|------|------|
| POST | `/api/auth/register` | — | `{name,email,password,phone?,role?}` `role user|vendor|delivery` default `user` | `201 {token,user}` 400 `name/email/password≥6`, `phone 10-15`, 409 `Email/Phone already` |
| POST | `/api/auth/login` | — | `{email,password}` | `200 {token,user}` 401 `Invalid credentials` |
| POST | `/api/auth/otp/request` | — | `{identifier: email|phone}` | `200 {message,identifier,otp? (dev only),expiresIn:300,channel}` 429 `Please wait Xs` (30s `lastSentAt`) |
| POST | `/api/auth/otp/verify` | — | `{identifier,otp,name?}` | `200 {token,user,message}` auto-create `user` if missing, 400 `No OTP|expired`, 401 `Invalid OTP x left`, 429 `Too many attempts` |
| GET | `/api/auth/me` | Bearer | — | `200 {user}` 401 `Missing/Invalid token` |
| PUT | `/api/auth/me` | Bearer | `{name,phone,addresses}` | `200 {user}` 400 `Invalid phone` |

`otpStore Map<key,{otp,expiresAt:now+5m,attempts,lastSentAt}>` + `setTimeout` delete, `env.isProd` hides `otp`.

## Categories & Products

* `GET /api/categories` → `{categories:[{id,name,slug,image}]}` 6 `women|men|kids|footwear|accessories|sale`
* `GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&featured=&page=&limit=` → `{products,total,page,limit,totalPages}` `search` `title|description|brand` `category` exact, `min|maxPrice`, `featured=true`, `sort price_asc|price_desc|rating|newest`, `page 1.. limit 1..50`.
* `GET /api/products/:id` → `{product}` 404
* `POST /api/products` `auth admin|vendor` → `{title,price*,category*,description,originalPrice,brand,images,stock,isFeatured}` → `{product}` `vendorId: vendor?req.user.id:null`
* `PUT /api/products/:id` `admin|vendor` (vendor only own `vendorId`) → `Object.assign + Number(price|originalPrice|stock)` → `{product}`
* `DELETE /api/products/:id` `admin|vendor` own → `{success:true}`
* `GET /api/products/:id/reviews` → `{reviews: sorted newest}`
* `POST /api/products/:id/reviews` `auth` `{rating 1-5,comment}` → `{review}` + recalc `product.rating = avg.toFixed(1)` + `reviewsCount`.

## Cart (auth)

* `GET /api/cart` → `{items:[{productId,qty,product}],total,count}`
* `POST /api/cart` `{productId,qty=1}` stock check → `{cart}`
* `PUT /api/cart/:productId` `{qty≥1}` stock check → `{cart}`
* `DELETE /api/cart/:productId` → `{cart}`
* `DELETE /api/cart` → `{success:true}` clear

## Wishlist (auth)

* `GET /api/wishlist` → `{wishlist: Product[]}`
* `POST /api/wishlist/:productId` toggle `added|removed` → `{action,wishlist:list}`
* `DELETE /api/wishlist/:productId` → `{wishlist}`

## Orders (auth)

* `POST /api/orders` `{shippingAddress{address,city,zip},paymentMethod=COD|Stripe|UPI,items?:[{productId,qty}]}` → if `items` provided validate `stock`, else use `carts[userId]`; `total = sum price*qty`; decrement `stock`; `order {id,userId,userName,userEmail,items:[{productId,title,price,qty,image}],total,status:pending,shippingAddress,paymentMethod,deliveryManId:null,createdAt,updatedAt}` → push `orders`, clear `carts`, `writeDb()` → `{order}` 400 `Cart empty|Insufficient stock`.
* `GET /api/orders` → `{orders}` filtered: `user` own only, `delivery` `!deliveryManId || deliveryManId===id`, `admin|vendor` all, sorted `createdAt desc`.
* `GET /api/orders/:id` → `{order}` 404 + `user` not owner → `403`.
* `PATCH /api/orders/:id/status` `{status:pending|processing|shipped|delivered|cancelled,deliveryManId?}` → checks `user only cancelled if pending` + `order.status pending`, `delivery` auto `deliveryManId=id` if null, `writeDb()` → `{order}`.
* `POST /api/orders/:id/assign` `admin` `{deliveryManId}` validates `user role delivery` → `order.deliveryManId=deliveryManId, status=processing`.

## Users (admin)

* `GET /api/users` `admin` → `{users: sanitized}`.

## Payments (mock, auth)

* `POST /api/payments/stripe/intent` `{amount,currency=inr}` → `{id:pi_mock_*,clientSecret,amount,currency,status:requires_payment_method,mock:true}` 400 `amount`.
* `POST /api/payments/stripe/confirm` `{paymentIntentId,cardLast4}` → `{id,status:succeeded}` or `402 {error:card_declined}` if `0000`.
* `POST /api/payments/cod` → `{status:pending,method:COD}`.

## Error Model

* `404 {error:"Not found",path,method}` via `setNotFoundHandler`
* `400 {error:"Validation error",message,details:validation}` `zod` via `validate()`
* `429 {error:"Too many requests",message,retryAfter}` `rate-limit`
* `401 {error:"Missing or invalid Authorization header"|"Invalid or expired token"}`
* `403 {error:"Forbidden: insufficient role"|"Not owner"}`
* `500 {error: isProd?"Internal server error":message, statusCode, requestId}`

## Client Usage

`frontend-user/src/api/client.js:7 apiFetch(path,{method,body,auth,headers,params})` → `fetch(API+path?params)` with `x-app-type:web x-app-role:user` + `Authorization`. `packages/api-client/src/index.ts:1 createApiClient` universal for Expo (`SecureStore`) + Electron (`preload`). `VITE_API_URL` / `EXPO_PUBLIC_API_URL` / `ELECTRON_API_URL` → base.

See `http://localhost:5000/docs` for live Swagger + `backend/src/schemas/common.js:1` `zod` + `backend/src/plugins/security.js:1`.
