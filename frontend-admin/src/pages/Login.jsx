import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'admin@shop.com', password: 'admin123' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setMsg(null)
    try {
      const data = await apiFetch('/api/auth/login', { method: 'POST', body: form })
      if (data.user.role !== 'admin') throw new Error('This account is not admin. Use admin@shop.com / admin123')
      login(data)
      navigate('/')
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80" alt="" />
        <div className="auth-visual-text">
          <h2>ADMIN<br/>CONSOLE</h2>
          <p>Manage products, orders, users and delivery assignments across Web, Mobile and Desktop.</p>
          <div className="visual-stats"><span>◆ Secure RBAC</span><span>◆ Real-time Ops</span></div>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-card">
          <h1>Admin Sign In</h1>
          <p className="muted">Vendor / Delivery? Use their dedicated apps. <Link to="/">Web user store →</Link></p>
          {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
          <form onSubmit={handleSubmit} className="form">
            <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="admin@shop.com" /></label>
            <label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="••••••••" /></label>
            <button disabled={loading} className="btn btn-dark btn-block">{loading ? 'Signing in...' : 'Enter Console →'}</button>
          </form>
          <p className="auth-switch">Demo: <code>admin@shop.com / admin123</code></p>
          <p className="fine">Backend: {import.meta.env.VITE_API_URL || 'http://localhost:5000'} • Role: admin • Desktop: Electron • Mobile: Expo</p>
        </div>
      </div>
    </div>
  )
}
