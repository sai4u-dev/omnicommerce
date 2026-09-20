# Mobile — Expo 52 (Android/iOS) + React Native

> 3 apps share single `backend :5000` (`x-app-type:mobile`) + `expo-secure-store` + `AsyncStorage`.

## Apps

* **User** `mobile-user` `com.velora.user` `velora-user` — Tabs `Shop (HomeScreen)` + `Bag (CartScreen)`, `LoginScreen` password|OTP, `SecureStore`.
* **Vendor** `mobile-vendor` `com.velora.vendor` — `VendorHome` add product (`title/price/stock/category`) + list `vendorId` filtered, `VendorOrders` `processing/shipped`.
* **Delivery** `mobile-deliveryman` `com.velora.delivery` — `DeliveryHome` filter `all|pending|...` + `Shipped/Delivered` + `Linking` Maps, `x-app-role:delivery`.

## Structure (each)

```
app.json: {expo: {name "VÉLORA — User|Vendor|Delivery", slug, version 1.0.0, icon/splash #FFFDFB, ios bundleIdentifier com.velora.*, android package, plugins ["expo-secure-store"], extra:{apiUrl:"http://localhost:5000", eas:{projectId}}, scheme}}
package.json: {name, main "App.js", scripts {start:"expo start", android, ios, web, build:"expo export"}, dependencies {expo ~52, expo-status-bar, expo-secure-store ~14, expo-constants ~17, react 18.3.1, react-native 0.76.5, @react-navigation/native 7, native-stack 7, bottom-tabs 7, screens 4.4, safe-area 4.12, gesture-handler 2.20, async-storage 2.1}}
babel.config.js: babel-preset-expo
eas.json: {build {development:{developmentClient:true}, preview, production:{autoIncrement:true, env:{EXPO_PUBLIC_API_URL:https://api.velora.example.com}}}}
src/api/client.js: API Constants.expoConfig.extra.apiUrl || EXPO_PUBLIC_API_URL || :5000, TOKEN_KEY velora_*_token, getToken() SecureStore→AsyncStorage, setAuth/clearAuth, apiFetch(path,{method,body,auth,headers,params}) → fetch with x-app-type:mobile,x-app-role:user|vendor|delivery
src/context/AuthContext.js: SecureStore+AsyncStorage, verify GET /api/auth/me auth, login/logout, isAuthenticated
src/screens/... : Home/Cart/Login/VendorOrders/DeliveryHome etc (StyleSheet, FlatList)
src/navigation/RootNavigator.js: NavigationContainer + native-stack + bottom-tabs, AuthProvider wrapper, loading → Verifying
App.js: import 'react-native-gesture-handler', AuthProvider + StatusBar + RootNavigator
assets/: icon.png/splash.png (placeholder)
```

## Key Screens

* **User `HomeScreen.js:1`** — `GET /api/products?search&category&limit 20` `FlatList 2 cols`, `search TextInput` + `pills`, `card` `discount -%` + `Featured`, `Add to Bag` → `POST /api/cart auth`, `CartScreen.js:1` `GET /api/cart` `FlatList` `qty -/+` `PUT /api/cart/:id {qty}` + `Remove DELETE` + `Checkout COD → POST /api/orders {shippingAddress, paymentMethod:COD}`.
* **LoginScreen.js:1** tabs `Password|OTP`, `form email/password` → `POST /api/auth/login` → `login`, `requestOtp` `POST /api/auth/otp/request` → `verifyOtp` `POST /api/auth/otp/verify`.
* **Vendor `VendorHome.js:1`** `GET /api/products` filter `!vendorId||vendorId===user.id`, `form title/price/stock/category chips` → `POST /api/products auth`, `DELETE`.
* **Delivery `DeliveryHome.js:1`** `GET /api/orders auth` `myOrders !deliveryManId||own`, `filter all|pending...`, `PATCH /api/orders/:id/status` `shipped|delivered`, `Linking openURL https://www.google.com/maps/search/?api=1&query=address city`.

## Run

```bash
pnpm --filter mobile-user start        # Metro, scan QR Expo Go
# device needs LAN IP
EXPO_PUBLIC_API_URL=http://192.168.1.20:5000 pnpm --filter mobile-user start
# emulator
pnpm --filter mobile-user run android # or ios
# other apps
pnpm --filter mobile-vendor start
pnpm --filter mobile-deliveryman start
```

* `expo-constants` `extra.apiUrl` fallback → `process.env.EXPO_PUBLIC_API_URL` → `:5000`.
* `CORS_ORIGIN` must include `exp://*` + LAN IP, same Wi-Fi.

## Build (EAS)

```bash
npx eas login
npx eas build --platform android --profile preview   # apk internal
npx eas build --platform all --profile production    # aab/ipa store (EXPO_PUBLIC_API_URL=https://api.velora.example.com)
npx eas update --branch production --message "shop fix" # OTA
```

`eas.json` `cli ≥13`, `developmentClient true`, `production autoIncrement`.

## Permissions (future)

* `expo-location` + `expo-notifications` for delivery live location + push (stub: `Linking` Maps now, add `expo-location` `requestForegroundPermissionsAsync` + `watchPositionAsync`).
* `expo-image-picker` for vendor product images (currently `images[0]` Unsplash).

See `ARCHITECTURE.md` for `x-app-*` + `BACKEND_API.md` for `cart|wishlist|orders`.
