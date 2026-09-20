import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'
import Navbar from '../components/Navbar'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('password') // 'password' | 'otp'
  const [form, setForm] = useState({ email: '', password: '' })
  const [otpForm, setOtpForm] = useState({ identifier: '', otp: '', name: '' })
  const [otpStep, setOtpStep] = useState('request') // request | verify
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null) // { type, text }
  const [showPass, setShowPass] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setMsg(null); setLoading(true)
    try {
      const data = await apiFetch('/api/auth/login', { method: 'POST', body: { email: form.email, password: form.password } })
      login(data)
      setMsg({ type: 'success', text: 'Welcome back!' })
      navigate('/home', { replace: true })
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    finally { setLoading(false) }
  }

  const requestOtp = async (e) => {
    e.preventDefault()
    if (!otpForm.identifier) return setMsg({ type: 'error', text: 'Enter email or phone' })
    setLoading(true); setMsg(null)
    try {
      const data = await apiFetch('/api/auth/otp/request', { method: 'POST', body: { identifier: otpForm.identifier } })
      setMsg({ type: 'success', text: `OTP sent! (dev: ${data.otp}) — valid 5 min` })
      setOtpStep('verify')
      // simple countdown
      setCountdown(30)
      const t = setInterval(() => setCountdown(c => { if (c <= 1) clearInterval(t); return c - 1 }), 1000)
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    finally { setLoading(false) }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    if (!otpForm.otp) return setMsg({ type: 'error', text: 'Enter OTP' })
    setLoading(true); setMsg(null)
    try {
      const data = await apiFetch('/api/auth/otp/verify', { method: 'POST', body: { identifier: otpForm.identifier, otp: otpForm.otp, name: otpForm.name } })
      login(data)
      setMsg({ type: 'success', text: 'OTP verified — welcome!' })
      navigate('/home', { replace: true })
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
    finally { setLoading(false) }
  }

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-visual">
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80" alt="Login visual" />
          <div className="auth-visual-text">
            <h2>WELCOME<br />BACK</h2>
            <p>Sign in to track orders, save your wishlist and unlock member pricing.</p>
            <div className="visual-stats">
              <span>✦ 4.9/5 Member Satisfaction</span>
              <span>✦ 2M+ Looks Shipped</span>
            </div>
          </div>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-card">
            <h1>Sign In</h1>
            <p className="muted">New to VÉLORA? <Link to="/signup">Create account</Link></p>

            <div className="tabs">
              <button className={mode === 'password' ? 'tab active' : 'tab'} onClick={() => { setMode('password'); setMsg(null) }}>Email & Password</button>
              <button className={mode === 'otp' ? 'tab active' : 'tab'} onClick={() => { setMode('otp'); setMsg(null); setOtpStep('request') }}>Phone / Email OTP</button>
            </div>

            {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

            {mode === 'password' ? (
              <form onSubmit={handlePasswordLogin} className="form">
                <label> Email
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                </label>
                <label> Password
                  <div className="input-with-btn">
                    <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                    <button type="button" className="eye-btn" onClick={() => setShowPass(s => !s)}>{showPass ? 'Hide' : 'Show'}</button>
                  </div>
                </label>
                <div className="form-foot">
                  <label className="check"><input type="checkbox" /> Remember me</label>
                  <a className="link">Forgot?</a>
                </div>
                <button disabled={loading} className="btn btn-dark btn-block">{loading ? 'Signing in...' : 'Sign In →'}</button>
                <div className="divider"><span>or</span></div>
                <button type="button" onClick={() => setMode('otp')} className="btn btn-outline btn-block">Continue with OTP</button>
              </form>
            ) : (
              <div className="form">
                {otpStep === 'request' ? (
                  <form onSubmit={requestOtp}>
                    <label> Email or Phone
                      <input required value={otpForm.identifier} onChange={e => setOtpForm({ ...otpForm, identifier: e.target.value })} placeholder="email@example.com or 9876543210" />
                      <span className="hint">We’ll send a 6-digit code valid for 5 minutes</span>
                    </label>
                    <button disabled={loading} className="btn btn-dark btn-block">{loading ? 'Sending...' : 'Send OTP →'}</button>
                    <p className="fine">Demo mode: OTP is shown on screen & console. No SMS/email provider needed.</p>
                  </form>
                ) : (
                  <form onSubmit={verifyOtp}>
                    <p className="muted">Code sent to <strong>{otpForm.identifier}</strong> <button type="button" className="link small" onClick={() => setOtpStep('request')}>Change</button></p>
                    {countdown > 0 && <p className="hint">Resend available in {countdown}s</p>}
                    <label> One-time code
                      <input required value={otpForm.otp} onChange={e => setOtpForm({ ...otpForm, otp: e.target.value })} placeholder="123456" maxLength={6} className="otp-input" />
                    </label>
                    <label> Name (for new accounts, optional)
                      <input value={otpForm.name} onChange={e => setOtpForm({ ...otpForm, name: e.target.value })} placeholder="Your name" />
                    </label>
                    <button disabled={loading} className="btn btn-dark btn-block">{loading ? 'Verifying...' : 'Verify & Sign In →'}</button>
                    <button type="button" disabled={countdown > 0 || loading} onClick={requestOtp} className="btn btn-ghost btn-block">Resend OTP</button>
                    <button type="button" onClick={() => setOtpStep('request')} className="btn btn-outline btn-block">Use different email/phone</button>
                  </form>
                )}
              </div>
            )}

            <p className="auth-switch">Demo accounts: <code>user@shop.com / user123</code> or try OTP with <code>9876543210</code></p>
          </div>
        </div>
      </div>
    </>
  )
}
