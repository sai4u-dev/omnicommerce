# Authentication — Proper (No Login After Login, Show User Name/Email)

> **Requirement:** User should not navigate to `/login` or `/signup` after successful login. In place of login/signup buttons show user `name` or `email` when logged-in, else show `Login`/`Create Account`.

## Flow Summary

1. **Password:** `Signup` → `POST /api/auth/register {name,email,password,phone}` → `login({token,user})` → `localStorage fashion_token/user` → `AuthContext isAuthenticated` → `PublicOnlyRoute` redirects `Navigate to="/home" replace` + `Navbar` shows avatar dropdown.
2. **Password Login:** `Login` password tab → `POST /api/auth/login {email,password}` → `login` → `navigate('/home',{replace:true})` → `PublicOnlyRoute` blocks `/login`.
3. **OTP:** `Login` OTP tab → `POST /api/auth/otp/request {identifier: email|phone 10-15d}` (30s `lastSentAt` throttle, 5m `expiresAt`, 3 attempts) → dev `otp` in response + server log `[OTP] id => 123456` → `POST /api/auth/otp/verify {identifier,otp,name?}` (auto-creates `user` if missing, `phone` → `phone.local` email, `bcrypt` random password) → `login` → `/home replace`.
4. **Verify on mount:** `AuthContext.jsx:15 verify()` → `fetch(${API}/api/auth/me) Bearer` (`API = VITE_API_URL || :5000` — fixed from `4000`), 401 → `logout()` clears keys + `auth:logout` event; cross-tab `storage` listener syncs `token/user`.

## Frontend — `frontend-user/src/`

### `context/AuthContext.jsx:1`
```js
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000' // fixed
const TOKEN_KEY = 'fashion_token', USER_KEY = 'fashion_user'
const [user,setUser] = useState(()=> JSON.parse(localStorage.getItem(USER_KEY)))
const [token,setToken] = useState(()=> localStorage.getItem(TOKEN_KEY))
const [loading,setLoading] = useState(!!localStorage.getItem(TOKEN_KEY))
const [initialized,setInitialized] = useState(false)
const logout = useCallback(()=>{ localStorage.removeItem(TOKEN_KEY); remove USER_KEY; setToken(null); setUser(null); setLoading(false); setInitialized(true); dispatchEvent(auth:logout)},[])
const login = useCallback(({token:t,user:u})=>{ setItem t,u; setToken(t); setUser(u); setLoading(false); setInitialized(true); dispatchEvent(auth:login)},[])
useEffect verify: fetch /api/auth/me Bearer + x-app-type:web,x-app-role:user → setUser or logout()
useEffect storage: window.addEventListener('storage', (e.key===TOKEN_KEY|USER_KEY) => setToken/setUser)
const isAuthenticated = !!token && !!user
```
Exposes `{user,token,login,logout,loading,initialized,isAuthenticated,API}` via `useAuth()`.

### `components/ProtectedRoute.jsx:1`
```jsx
export function ProtectedRoute({children}){
  const {isAuthenticated,loading,initialized}=useAuth()
  const location=useLocation()
  if(loading||!initialized) return <div className="loading-screen"><div className="spinner"/><p>Verifying session...</p></div>
  if(!isAuthenticated) return <Navigate to="/login" replace state={{from:location}}/>
  return children
}
export function PublicOnlyRoute({children}){
  const {isAuthenticated,loading,initialized}=useAuth()
  if(loading||!initialized) return <div className="loading-screen"><div className="spinner"/><p>Checking session...</p></div>
  if(isAuthenticated) return <Navigate to="/home" replace/>
  return children
}
```
* Guards: `/home|/cart|/wishlist|/checkout|/orders` wrapped `ProtectedRoute`; `/login|/signup` wrapped `PublicOnlyRoute`. `replace` prevents back-button revisiting login.

### `components/Navbar.jsx:1`
```jsx
const {isAuthenticated,user,logout,loading,initialized}=useAuth()
const [cartCount,wishCount]=useState(0)
const [menuOpen,setMenuOpen]=useState(false)
const menuRef=useRef(null)
useEffect if (!isAuthenticated) reset counts; else fetch GET /api/cart count + GET /api/wishlist length every 5s + on cart:updated|wishlist:updated|auth:login
const showAuthActions = !loading && initialized && !isAuthenticated
const showUserActions = !loading && initialized && isAuthenticated
const displayName = user?.name || user?.email?.split('@')[0]
const avatarLetter = displayName[0].toUpperCase()
```
* **Logged-out:** `showAuthActions` → `<Link to="/login">Login</Link>` + `<Link to="/signup" className="btn btn-dark">Create Account</Link>` + `LANDING/SHOP/COLLECTIONS`.
* **Logged-in:** `showUserActions` → `Bag (badge count)` + `♡ Wishlist (count)` + `Orders` + **user button** `avatarLetter + displayName + ▼/▲` → dropdown `position:absolute` `name + email (break-all) + phone` + `My Orders/Wishlist/Bag (count)` + `Logout` (`logout(); navigate('/',{replace:true})`). No `Login/Create Account` rendered. `…` placeholder while `loading` to avoid flash.

### `pages/Login.jsx:19,46` + `Signup.jsx:15`
```js
const data = await apiFetch('/api/auth/login|register', {method:'POST', body})
login(data)
navigate('/home',{replace:true}) // replace history entry
```
`Login` has `mode password|otp`, `form {email,password}`, `otpForm {identifier,otp,name}`, `otpStep request|verify`, `countdown 30s`, `eye-btn` toggle. `Signup` validates `name,email,password≥6,confirm`, `phone` optional, `terms` checkbox.

### `App.jsx:13`
```jsx
<Routes>
  <Route path="/" element={<Landing/>}/>
  <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
  <Route path="/product/:id" element={<ProductDetail/>}/> // public
  <Route path="/cart" element={<ProtectedRoute><Cart/></ProtectedRoute>}/>
  <Route path="/wishlist" element={<ProtectedRoute><Wishlist/></ProtectedRoute>}/>
  <Route path="/checkout" element={<ProtectedRoute><Checkout/></ProtectedRoute>}/>
  <Route path="/orders" element={<ProtectedRoute><Orders/></ProtectedRoute>}/>
  <Route path="/login" element={<PublicOnlyRoute><Login/></PublicOnlyRoute>}/>
  <Route path="/signup" element={<PublicOnlyRoute><Signup/></PublicOnlyRoute>}/>
  <Route path="*" element={<Navigate to="/" replace/>}/>
</Routes>
```

## Backend `backend/src/routes/auth.js:1`

* `normalizeIdentifier` (email `toLowerCase` else digits), `isEmail`, `isValidEmail`, `isValidPhone 10-15`, `genOtp()` 6-digit.
* `otpStore Map<key,{otp,expiresAt,attempts,lastSentAt}>` `OTP_TTL 5m`, `OTP_RESEND 30s`, `setTimeout` auto-delete.
* `POST /api/auth/register` → check `name/email/password≥6`, `phone` valid, `email/phone` unique, `allowedRoles user|vendor|delivery` default `user`, `bcrypt.hashSync 10`, `uuid`, `addresses:[]`, `signToken({id,email,role,name})`.
* `POST /api/auth/login` → `bcrypt.compareSync`, `signToken`.
* `POST /api/auth/otp/request` → `isEmail? isValidEmail : isValidPhone`, throttle `429 wait Xs`, `genOtp`, `otpStore.set`, `console.log [OTP]`, `isProd? hide otp : return otp` + `expiresIn 300`.
* `POST /api/auth/otp/verify` → `record` exists, `expiresAt`, `attempts≥3 →429`, `otp mismatch → attempts++ 401 left`, success → `otpStore.delete`, find `user` by `email|phone`, auto-create if missing (`placeholderEmail phone.local`, `bcrypt uuid`), `signToken`.
* `GET /api/auth/me` `authPreHandler` → `verifyToken Bearer` → `req.user`, `PUT /api/auth/me` → update `name/phone/addresses` + `writeDb()`.
* `utils/auth.js:1` `authPreHandler` `Bearer` → `verifyToken` → `req.user` else `401`, `requireRole(...roles)` → `403`.

## Testing

* **Manual:** `user@shop.com/user123` login → `Navbar` shows `Ava` avatar + `user@shop.com` dropdown, `/login` direct → redirects `/home`; `Logout` → `Login/Create Account` reappears, `/cart` → redirects `/login`.
* **OTP:** `POST /api/auth/otp/request {"identifier":"9876543210"}` → `otp` in dev, verify → `token`.
* **Cross-tab:** Login in one tab → `storage` event updates other tab `isAuthenticated`.

See `../README.md#authentication--user-display` for UX, `ECOMMERCE_CORE.md` for protected e-commerce flows.
