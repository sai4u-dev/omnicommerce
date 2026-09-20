import { getStorage } from './storage.js'

export type AppType = 'web' | 'mobile' | 'desktop'
export type AppRole = 'user' | 'admin' | 'vendor' | 'delivery'

export interface ApiClientConfig {
  baseUrl: string
  appType?: AppType
  appRole?: AppRole
  getToken?: () => string | null | Promise<string | null>
  onUnauthorized?: () => void | Promise<void>
}

export class ApiError extends Error {
  status: number
  data: any
  constructor(message: string, status: number, data: any) {
    super(message)
    this.status = status
    this.data = data
  }
}

function resolveBaseUrl(configBase?: string): string {
  if (configBase) return configBase.replace(/\/$/, '')
  // web: VITE_API_URL
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const env = (import.meta as any).env
    if (env.VITE_API_URL) return String(env.VITE_API_URL).replace(/\/$/, '')
    if (env.EXPO_PUBLIC_API_URL) return String(env.EXPO_PUBLIC_API_URL).replace(/\/$/, '')
  }
  // react-native: EXPO_PUBLIC_API_URL
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return String(process.env.EXPO_PUBLIC_API_URL).replace(/\/$/, '')
  }
  if (typeof process !== 'undefined' && process.env?.VITE_API_URL) {
    return String(process.env.VITE_API_URL).replace(/\/$/, '')
  }
  return 'http://localhost:5000'
}

export function createApiClient(config: ApiClientConfig = { baseUrl: resolveBaseUrl() }) {
  const baseUrl = (config.baseUrl || resolveBaseUrl()).replace(/\/$/, '')
  const appType = config.appType || 'web'
  const appRole = config.appRole || 'user'

  async function getToken(): Promise<string | null> {
    if (config.getToken) {
      const t = config.getToken()
      return t instanceof Promise ? await t : t
    }
    // fallback to storage
    try {
      const s = getStorage()
      const v = s.getItem('fashion_token') ?? s.getItem('token') ?? s.getItem('auth_token')
      return v instanceof Promise ? await v : (v as string | null)
    } catch {
      return null
    }
  }

  async function request<T>(
    path: string,
    opts: { method?: string; body?: any; auth?: boolean; headers?: Record<string, string>; params?: Record<string, any> } = {}
  ): Promise<T> {
    const method = (opts.method || 'GET').toUpperCase()
    let url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`
    if (opts.params) {
      const usp = new URLSearchParams()
      for (const [k, v] of Object.entries(opts.params)) {
        if (v !== undefined && v !== null && v !== '') usp.set(k, String(v))
      }
      const qs = usp.toString()
      if (qs) url += `?${qs}`
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-app-type': appType,
      'x-app-role': appRole,
      ...(opts.headers || {}),
    }

    if (opts.auth) {
      const token = await getToken()
      if (token) headers.Authorization = `Bearer ${token}`
    }

    const fetchOpts: RequestInit = { method, headers }
    if (opts.body !== undefined && method !== 'GET' && method !== 'HEAD') {
      fetchOpts.body = JSON.stringify(opts.body)
    }

    const res = await fetch(url, fetchOpts)
    const text = await res.text()
    let data: any = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      data = { raw: text }
    }

    if (!res.ok) {
      const msg = data.error || data.message || `Request failed ${res.status}`
      if (res.status === 401 && config.onUnauthorized) {
        try { await config.onUnauthorized() } catch {}
      }
      throw new ApiError(msg, res.status, data)
    }
    return data as T
  }

  return {
    baseUrl,
    request,
    get: <T>(path: string, opts?: any) => request<T>(path, { ...opts, method: 'GET' }),
    post: <T>(path: string, body?: any, opts?: any) => request<T>(path, { ...opts, method: 'POST', body }),
    put: <T>(path: string, body?: any, opts?: any) => request<T>(path, { ...opts, method: 'PUT', body }),
    patch: <T>(path: string, body?: any, opts?: any) => request<T>(path, { ...opts, method: 'PATCH', body }),
    del: <T>(path: string, opts?: any) => request<T>(path, { ...opts, method: 'DELETE' }),

    // domain helpers
    auth: {
      register: (payload: any) => request<{ token: string; user: any }>('/api/auth/register', { method: 'POST', body: payload }),
      login: (payload: any) => request<{ token: string; user: any }>('/api/auth/login', { method: 'POST', body: payload }),
      otpRequest: (identifier: string) => request<any>('/api/auth/otp/request', { method: 'POST', body: { identifier } }),
      otpVerify: (payload: any) => request<{ token: string; user: any }>('/api/auth/otp/verify', { method: 'POST', body: payload }),
      me: () => request<{ user: any }>('/api/auth/me', { method: 'GET', auth: true }),
      updateMe: (payload: any) => request<{ user: any }>('/api/auth/me', { method: 'PUT', auth: true, body: payload }),
    },
    products: {
      list: (params?: any) => request<{ products: any[]; total: number; page: number; totalPages: number }>('/api/products', { method: 'GET', params }),
      get: (id: string) => request<{ product: any }>(`/api/products/${id}`, { method: 'GET' }),
      create: (payload: any) => request<{ product: any }>('/api/products', { method: 'POST', auth: true, body: payload }),
      update: (id: string, payload: any) => request<{ product: any }>(`/api/products/${id}`, { method: 'PUT', auth: true, body: payload }),
      remove: (id: string) => request<any>(`/api/products/${id}`, { method: 'DELETE', auth: true }),
      reviews: (id: string) => request<{ reviews: any[] }>(`/api/products/${id}/reviews`, { method: 'GET' }),
      addReview: (id: string, payload: any) => request<any>(`/api/products/${id}/reviews`, { method: 'POST', auth: true, body: payload }),
    },
    categories: {
      list: () => request<{ categories: any[] }>('/api/categories', { method: 'GET' }),
    },
    cart: {
      get: () => request<{ items: any[]; total: number; count: number }>('/api/cart', { method: 'GET', auth: true }),
      add: (productId: string, qty = 1) => request<any>('/api/cart', { method: 'POST', auth: true, body: { productId, qty } }),
      update: (productId: string, qty: number) => request<any>(`/api/cart/${productId}`, { method: 'PUT', auth: true, body: { qty } }),
      remove: (productId: string) => request<any>(`/api/cart/${productId}`, { method: 'DELETE', auth: true }),
      clear: () => request<any>('/api/cart', { method: 'DELETE', auth: true }),
    },
    wishlist: {
      get: () => request<{ wishlist: any }>(`/api/wishlist`, { method: 'GET', auth: true }),
      toggle: (productId: string) => request<any>(`/api/wishlist/${productId}`, { method: 'POST', auth: true }),
    },
    orders: {
      list: () => request<{ orders: any[] }>('/api/orders', { method: 'GET', auth: true }),
      get: (id: string) => request<{ order: any }>(`/api/orders/${id}`, { method: 'GET', auth: true }),
      create: (payload: any) => request<{ order: any }>('/api/orders', { method: 'POST', auth: true, body: payload }),
      updateStatus: (id: string, status: string, extra?: any) => request<any>(`/api/orders/${id}/status`, { method: 'PATCH', auth: true, body: { status, ...extra } }),
      assign: (id: string, deliveryManId: string) => request<any>(`/api/orders/${id}/assign`, { method: 'POST', auth: true, body: { deliveryManId } }),
    },
    users: {
      list: () => request<{ users: any[] }>('/api/users', { method: 'GET', auth: true }),
    },
    health: () => request<any>('/api/health', { method: 'GET' }),
    stats: () => request<any>('/api/stats', { method: 'GET' }),
  }
}

// default singleton for web
export const api = createApiClient()

export default api
