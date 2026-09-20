import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const AuthContext = createContext(null)
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const TOKEN_KEY = 'fashion_token'
const USER_KEY = 'fashion_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem(USER_KEY); return s ? JSON.parse(s) : null } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY))
  const [initialized, setInitialized] = useState(false)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    setLoading(false)
    setInitialized(true)
    // notify other tabs / components
    window.dispatchEvent(new Event('auth:logout'))
  }, [])

  const login = useCallback(({ token: t, user: u }) => {
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setToken(t)
    setUser(u)
    setLoading(false)
    setInitialized(true)
    window.dispatchEvent(new Event('auth:login'))
  }, [])

  // validate token on mount and when token changes
  useEffect(() => {
    let cancelled = false
    async function verify() {
      const currentToken = localStorage.getItem(TOKEN_KEY)
      if (!currentToken) {
        if (!cancelled) { setLoading(false); setInitialized(true) }
        return
      }
      try {
        setLoading(true)
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${currentToken}`, 'x-app-type': 'web', 'x-app-role': 'user' }
        })
        if (!res.ok) throw new Error('invalid token')
        const data = await res.json()
        if (!cancelled) {
          setUser(data.user)
          localStorage.setItem(USER_KEY, JSON.stringify(data.user))
          setToken(currentToken)
        }
      } catch {
        if (!cancelled) logout()
      } finally {
        if (!cancelled) { setLoading(false); setInitialized(true) }
      }
    }
    verify()
    return () => { cancelled = true }
  }, [logout])

  // sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === TOKEN_KEY || e.key === USER_KEY) {
        const t = localStorage.getItem(TOKEN_KEY)
        const uRaw = localStorage.getItem(USER_KEY)
        let u = null
        try { u = uRaw ? JSON.parse(uRaw) : null } catch { u = null }
        setToken(t)
        setUser(u)
        setInitialized(true)
        setLoading(false)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const isAuthenticated = !!token && !!user

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, initialized, isAuthenticated, API }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
