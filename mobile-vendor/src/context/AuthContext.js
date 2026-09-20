import React, { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiFetch, TOKEN_KEY, USER_KEY } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        let t = await SecureStore.getItemAsync(TOKEN_KEY)
        if (!t) t = await AsyncStorage.getItem(TOKEN_KEY)
        if (!t) { setLoading(false); setInitialized(true); return }
        setToken(t)
        const data = await apiFetch('/api/auth/me', { auth: true })
        setUser(data.user)
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user))
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(()=>{})
        await AsyncStorage.removeItem(TOKEN_KEY)
        await AsyncStorage.removeItem(USER_KEY)
        setToken(null); setUser(null)
      } finally { setLoading(false); setInitialized(true) }
    })()
  }, [])

  const login = async ({ token: t, user: u }) => {
    await SecureStore.setItemAsync(TOKEN_KEY, t)
    await AsyncStorage.setItem(TOKEN_KEY, t)
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u))
    setToken(t); setUser(u)
  }
  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(()=>{})
    await AsyncStorage.removeItem(TOKEN_KEY)
    await AsyncStorage.removeItem(USER_KEY)
    setToken(null); setUser(null)
  }
  const isAuthenticated = !!token && !!user
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
