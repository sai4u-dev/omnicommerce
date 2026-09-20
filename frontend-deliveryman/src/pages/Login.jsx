import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'
export default function Login(){
  const {login}=useAuth()
  const navigate=useNavigate()
  const [form,setForm]=useState({email:'delivery@shop.com', password:'delivery123'})
  const [loading,setLoading]=useState(false)
  const [msg,setMsg]=useState(null)
  const handleSubmit=async(e)=>{
    e.preventDefault(); setLoading(true); setMsg(null)
    try{
      const data=await apiFetch('/api/auth/login',{method:'POST', body:form})
      if(data.user.role!=='delivery' && data.user.role!=='admin') throw new Error('This account is not delivery. Use delivery@shop.com / delivery123')
      login(data); navigate('/')
    }catch(err){ setMsg({type:'error', text:err.message}) }
    finally{ setLoading(false)}
  }
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img src="https://images.unsplash.com/photo-1519003722824-194243704534?w=900&q=80" alt="" />
        <div className="auth-visual-text">
          <h2>DELIVERY<br/>PARTNER</h2>
          <p>Track assigned orders, update delivery status, and manage routes. Web + Expo Mobile.</p>
          <div className="visual-stats"><span>◆ On-time delivery</span><span>◆ Earnings tracked</span></div>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-card">
          <h1>Delivery Sign In</h1>
          <p className="muted">Admin assigns orders to you • Real-time pipeline</p>
          {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
          <form onSubmit={handleSubmit} className="form">
            <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
            <label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></label>
            <button disabled={loading} className="btn btn-dark btn-block">{loading?'Signing in...':'Enter Dashboard →'}</button>
          </form>
          <p className="auth-switch">Demo: <code>delivery@shop.com / delivery123</code></p>
          <p className="fine">Backend same as User/Vendor/Admin. Mobile: Expo app mirrors this Web UI with GPS-ready hooks.</p>
        </div>
      </div>
    </div>
  )
}
