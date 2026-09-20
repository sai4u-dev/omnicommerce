import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [health, setHealth] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, h, o] = await Promise.all([
          apiFetch('/api/stats'),
          apiFetch('/api/health'),
          apiFetch('/api/orders', { auth: true })
        ])
        setStats(s); setHealth(h); setOrders(o.orders?.slice(0,5) || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading admin...</p></div>

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="muted">Single backend powering Web • Expo Mobile • Electron Desktop • Health: {health?.status} • Uptime {Math.round(health?.uptime || 0)}s</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card"><span>Products</span><strong>{stats?.products ?? 0}</strong><em>Fashion catalog</em></div>
        <div className="stat-card"><span>Users</span><strong>{stats?.users ?? 0}</strong><em>Across all roles</em></div>
        <div className="stat-card"><span>Orders</span><strong>{stats?.orders ?? 0}</strong><em>Total pipeline</em></div>
        <div className="stat-card"><span>Categories</span><strong>{stats?.categories ?? 0}</strong><em>Women/Men/Kids...</em></div>
      </div>

      <div className="card">
        <h3>Recent Orders</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {orders.length ? orders.map(o => (
                <tr key={o.id}><td title={o.id}>{o.id.slice(0,8)}…</td><td>{o.userName}</td><td>${o.total}</td><td><span className={`badge ${o.status}`}>{o.status}</span></td><td>{new Date(o.createdAt).toLocaleDateString()}</td></tr>
              )) : <tr><td colSpan={5} className="muted">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card muted-card">
        <h4>Production Architecture</h4>
        <p><strong>Backend:</strong> Fastify :5000 • JWT RBAC (user/vendor/delivery/admin) • File JSON (dev) → Postgres (prod) • Swagger @ /docs • Helmet + CORS + Rate-limit</p>
        <p><strong>Apps:</strong> User Web (5173) • Admin Web (5174) + Desktop Electron • Vendor Web (5175) + Mobile Expo + Desktop • Delivery Web (5176) + Mobile Expo • All via <code>x-app-type / x-app-role</code> headers</p>
        <p><strong>Deploy:</strong> Docker Compose + Nginx • pnpm + Turbo • GitHub Actions • Env: VITE_API_URL / EXPO_PUBLIC_API_URL</p>
      </div>
    </div>
  )
}
