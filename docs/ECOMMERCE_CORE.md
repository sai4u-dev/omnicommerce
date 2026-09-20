# E-Commerce Core — Cart, Wishlist, Product Detail, Checkout, Orders

> User Web `frontend-user :5173` + `mobile-user` share same `backend :5000` flows. All `auth:true` via `fashion_token` + `x-app-type:web`.

## Home — Shop

`frontend-user/src/pages/Home.jsx:1`

* **Fetch:** `GET /api/categories` → pills `All|women|men|kids|footwear|accessories|sale`; `GET /api/products?search=&category=&sort=&featured=&page=&limit=` (`featured=true` default) → `product-grid`.
* **UI:** `home-header` `WELCOME BACK, AVA` + `search-bar` + `sort-select` (`featured|price_asc|price_desc|rating`), `filter-pills`, `promo-strip` `WELCOME20`.
* **Wishlist state:** `wishlistIds Set` from `GET /api/wishlist auth`; `toggleWishlist(productId)` → `POST /api/wishlist/:id auth` → `added|removed` → `Set` update + `dispatchEvent(wishlist:updated)` + toast `Saved/Removed`.
* **Cart:** `addToCart(productId)` → `POST /api/cart {productId,qty:1} auth` → `dispatchEvent(cart:updated)` → Navbar badge updates + toast `Added to bag`; 401 → `navigate('/login')`.
* **Card:** `product-img-wrap` click → `navigate(/product/:id)`, `discount -%` + `FEATURED`, `♡→♥` active `background:var(--ink)`, `brand`, `title` clickable, `★ rating (reviewsCount) stock`, `₹ price/originalPrice`, `Add to Bag` + `View details →`. Toast fixed `top 70 left 50%` `background var(--ink)|#B42318`.

## Product Detail

`src/pages/ProductDetail.jsx:1`

* **Load:** `GET /api/products/:id` → `product` + `GET /api/products/:id/reviews` → `reviews` + `GET /api/wishlist` → `wished`.
* **Gallery:** `images[0]` `520h` + thumbnails `90x90`, `brand·category`, `★ rating (n) stock Featured`, `description`, `₹ price/originalPrice -%`.
* **Qty:** `−/+` clamped `1..stock`, `Add to Bag — ₹total` → `POST /api/cart {productId,qty}` + toast, `♡/♥ Wishlist` toggle → `POST /api/wishlist/:id`.
* **Badges:** `Free shipping/COD/30-day/Secure` + `Go to Bag` + `Back to shop`.
* **Reviews:** `GET` list + `POST /api/products/:id/reviews {rating 1-5,comment} auth` → prepend + `GET /api/products/:id` refresh avg `rating` + `reviewsCount` (backend recalculates). Empty → `Be the first!`.

## Cart

`src/pages/Cart.jsx:1`

* **State:** `GET /api/cart auth` → `{items:{product,productId,qty},total,count}` enriched, `loading` spinner.
* **Actions:** `PUT /api/cart/:id {qty}` (`−` disabled `qty≤1`, `+` disabled `qty≥stock`), `DELETE /api/cart/:id` remove, `DELETE /api/cart` clear (confirm). Image `90x110` + `brand/title/price/stock` + `Remove/View` links + per-item `₹ price*qty`.
* **Summary:** `Estimated Total ₹total` + `Free shipping` + `Promo WELCOME20` + `Clear Bag + Continue Shopping + Checkout →`.

## Wishlist

`src/pages/Wishlist.jsx:1`

* `GET /api/wishlist auth` → `wishlist: Product[]`; `POST /api/wishlist/:id auth` toggle (active `♥` `var(--ink)`), `Add to Bag` per card, `View details`. Empty → `No saved items. Explore Shop ♡`.

## Checkout

`src/pages/Checkout.jsx:1`

* **Load:** `GET /api/cart auth` + `GET /api/auth/me auth` phone prefill, `address {address,city,zip,country,phone}`, `paymentMethod COD|Stripe|UPI` radio cards ( `COD` description, `Stripe mock 4242 succeeds 0000 fails`, `UPI mock`), `card {number,exp,cvv}` stripe fields.
* **Place:** `placeOrder e.preventDefault` → validate `count>0` + `address/city`, `setPlacing true`; if `Stripe` → `POST /api/payments/stripe/intent {amount:total*100,currency:inr} auth` → `POST /api/payments/stripe/confirm {paymentIntentId,cardLast4} auth` (mock 0000 → `402 card_declined`), then `POST /api/orders {shippingAddress,paymentMethod} auth` (no `items` → server uses cart). `COD/UPI` direct. `dispatchEvent(cart:updated)` + `navigate('/orders',{replace})` after `1200ms`. `Pay on delivery — ₹total` vs `Pay now`.
* **Summary:** sticky `Order summary — n items` scroll `380h` + `Subtotal/Shipping Free/Total` + `Edit bag`.

## Orders

`src/pages/Orders.jsx:1`

* `GET /api/orders auth` (`user` own only) → timeline `id.slice(0,8)` + badge `status` (`pending 9A3412, processing 1E40AF, shipped 0C4A6E, delivered 065F46, cancelled 991B1B`), `date/paymentMethod/deliveryManId`, `address`, `items` `image+title+qty×price → ₹total`, `total`. `PATCH /api/orders/:id/status {status:cancelled} auth` only `pending` → confirm.

## Backend — E-Commerce Routes

* `backend/src/routes/cart.js:1` `GET /api/cart auth` → `enriched product + total/count`, `POST {productId,qty}` stock check, `PUT :productId {qty}`, `DELETE :productId`, `DELETE /api/cart` clear → `writeDb()`.
* `wishlist.js:1` `GET` + `POST toggle added|removed` + `DELETE`.
* `products.js:1` `GET list filtered`, `GET :id`, `POST/PUT/DELETE admin|vendor` `vendorId` binding, `GET/POST :id/reviews` recalc `rating`.
* `orders.js:1` `POST` from `cart` or `directItems`, `total = sum price*qty`, decrement `stock`, push `order {id,userId,userName,userEmail,items,total,status:pending,shippingAddress,paymentMethod,deliveryManId:null,createdAt,updatedAt}`, clear `carts[userId]`; `GET filtered by role`, `GET :id` 403 if user not owner, `PATCH :id/status` checks `user only cancelled if pending`.
* `payments.js:1` `POST /payments/stripe/intent {amount,currency}` → `pi_mock_*` + `clientSecret`, `POST /payments/stripe/confirm {paymentIntentId,cardLast4}` → `402` if `0000`, `POST /payments/cod` passthrough.

## Shared API Client

`frontend-user/src/api/client.js:1` `API = VITE_API_URL||5000`, `getToken() fashion_token`, `apiFetch(path,{method,body,auth,headers,params})` → `fetch(API+path)` with `Content-Type, x-app-type:web,x-app-role:user` + `Authorization Bearer`.

See `AUTHENTICATION.md` for protection + `BACKEND_API.md` for `x-app-*` + Swagger.
