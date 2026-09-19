import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('fashion_user'); return s ? JSON.parse(s) : null } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('fashion_token') || null)
  const [loading, setLoading] = useState(!!token)
  const [initialized, setInitialized] = useState(false)

  // validate token on mount
  useEffect(() => {
    async function verify() {
      if (!token) { setLoading(false); setInitialized(true); return }
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('invalid')
        const data = await res.json()
        setUser(data.user)
        localStorage.setItem('fashion_user', JSON.stringify(data.user))
      } catch {
        logout()
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }
    verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = ({ token: t, user: u }) => {
    localStorage.setItem('fashion_token', t)
    localStorage.setItem('fashion_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('fashion_token')
    localStorage.removeItem('fashion_user')
    setToken(null)
    setUser(null)
    setLoading(false)
    setInitialized(true)
  }

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
