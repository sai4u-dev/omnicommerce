import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch, getToken, clearAuth, setAuth } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('admin_user'); return s ? JSON.parse(s) : null } catch { return null }
  })
  const [token, setToken] = useState(() => getToken())
  const [loading, setLoading] = useState(!!getToken())
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    async function verify() {
      if (!token) { setLoading(false); setInitialized(true); return }
      try {
        const data = await apiFetch('/api/auth/me', { auth: true })
        setUser(data.user)
        localStorage.setItem('admin_user', JSON.stringify(data.user))
        if (data.user.role !== 'admin') throw new Error('Not admin')
      } catch {
        logout()
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }
    verify()
  }, [])

  const login = ({ token: t, user: u }) => {
    if (u.role !== 'admin') throw new Error('Only admin can access admin panel')
    setAuth(t, u)
    setToken(t)
    setUser(u)
  }

  const logout = () => {
    clearAuth()
    setToken(null)
    setUser(null)
    setLoading(false)
    setInitialized(true)
  }

  const isAuthenticated = !!token && !!user && user.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, initialized, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
