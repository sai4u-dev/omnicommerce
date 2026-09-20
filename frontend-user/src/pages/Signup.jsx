import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'
import Navbar from '../components/Navbar'

export default function Signup() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (!form.name || !form.email || !form.password) return setMsg({ type: 'error', text: 'Name, email and password required' })
    if (form.password.length < 6) return setMsg({ type: 'error', text: 'Password must be at least 6 chars' })
    if (form.password !== form.confirm) return setMsg({ type: 'error', text: 'Passwords do not match' })
    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email, password: form.password, phone: form.phone || undefined }
      const data = await apiFetch('/api/auth/register', { method: 'POST', body: payload })
      login(data)
      setMsg({ type: 'success', text: 'Account created! Welcome to VÉLORA' })
      navigate('/home', { replace: true })
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    finally { setLoading(false) }
  }

  return (
    <>
      <Navbar />
      <div className="auth-page reverse">
        <div className="auth-form-wrap">
          <div className="auth-card">
            <h1>Create Account</h1>
            <p className="muted">Already have an account? <Link to="/login">Sign in</Link></p>

            {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

            <form onSubmit={handleSubmit} className="form">
              <label> Full name
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ava Mitchell" />
              </label>
              <label> Email
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="ava@example.com" />
              </label>
              <label> Phone (optional, for OTP login)
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
                <span className="hint">We’ll use this for Phone OTP login & delivery updates</span>
              </label>
              <label> Password
                <div className="input-with-btn">
                  <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(s => !s)}>{showPass ? 'Hide' : 'Show'}</button>
                </div>
              </label>
              <label> Confirm password
                <input type={showPass ? 'text' : 'password'} required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" />
              </label>

              <label className="check terms"><input type="checkbox" required /> I agree to <a>Terms</a> and <a>Privacy Policy</a></label>

              <button disabled={loading} className="btn btn-dark btn-block">{loading ? 'Creating...' : 'Create Account →'}</button>
              <div className="divider"><span>or</span></div>
              <Link to="/login" className="btn btn-outline btn-block" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none' }}>Continue with OTP</Link>
            </form>

            <ul className="benefits">
              <li>✓ 15% off first order</li>
              <li>✓ Early access to new drops</li>
              <li>✓ Free returns for 30 days</li>
            </ul>
          </div>
        </div>

        <div className="auth-visual">
          <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80" alt="Signup visual" />
          <div className="auth-visual-text">
            <h2>JOIN THE<br />HOUSE</h2>
            <p>Be part of VÉLORA. Sustainable luxury, delivered with care.</p>
            <div className="visual-cards">
              <div className="mini-card"> <strong>50k+</strong> members love us </div>
              <div className="mini-card"> <strong>New</strong> Womens Edit live </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
