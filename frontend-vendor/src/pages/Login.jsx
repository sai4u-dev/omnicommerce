import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'
export default function Login(){
  const {login}=useAuth()
  const navigate=useNavigate()
  const [form,setForm]=useState({email:'vendor@shop.com', password:'vendor123'})
  const [mode,setMode]=useState('password') // password | otp | register
  const [regForm,setRegForm]=useState({name:'', email:'', password:'', phone:''})
  const [otpForm,setOtpForm]=useState({identifier:'', otp:''})
  const [otpStep,setOtpStep]=useState('request')
  const [loading,setLoading]=useState(false)
  const [msg,setMsg]=useState(null)

  const handlePassword=async(e)=>{
    e.preventDefault(); setLoading(true); setMsg(null)
    try{
      const data=await apiFetch('/api/auth/login',{method:'POST', body:form})
      login(data); navigate('/')
    }catch(err){ setMsg({type:'error', text:err.message}) }
    finally{ setLoading(false)}
  }
  const handleRegister=async(e)=>{
    e.preventDefault(); setLoading(true); setMsg(null)
    try{
      const data=await apiFetch('/api/auth/register',{method:'POST', body:{...regForm, role:'vendor'}})
      login(data); navigate('/')
    }catch(err){ setMsg({type:'error', text:err.message})}
    finally{ setLoading(false)}
  }
  const requestOtp=async(e)=>{
    e.preventDefault(); setLoading(true)
    try{
      const data=await apiFetch('/api/auth/otp/request',{method:'POST', body:{identifier: otpForm.identifier}})
      setMsg({type:'success', text:`OTP sent ${!data.otp?'':' dev:'+data.otp}`}); setOtpStep('verify')
    }catch(err){ setMsg({type:'error', text:err.message}) } finally{ setLoading(false)}
  }
  const verifyOtp=async(e)=>{
    e.preventDefault(); setLoading(true)
    try{
      const data=await apiFetch('/api/auth/otp/verify',{method:'POST', body:{identifier: otpForm.identifier, otp: otpForm.otp}})
      // upgrade role to vendor if new user default is user - keep as user but allow vendor panel? we force vendor role via register; otp creates user role, so we block vendor panel for pure user? For demo allow.
      if(data.user.role!=='vendor' && data.user.role!=='admin'){
        // optionally auto-upgrade? For now allow but inform
        setMsg({type:'error', text:'OTP account is user role. Register as vendor or use vendor@shop.com'})
        return
      }
      login(data); navigate('/')
    }catch(err){ setMsg({type:'error', text:err.message}) } finally{ setLoading(false)}
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80" alt="" />
        <div className="auth-visual-text">
          <h2>VENDOR<br/>STUDIO</h2>
          <p>Launch products, manage inventory, fulfill orders. Web + Expo Mobile + Electron Desktop.</p>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-card">
          <h1>Vendor Access</h1>
          <p className="muted"><Link to="/login">Have an account?</Link> • Single backend for all apps</p>
          <div className="tabs">
            <button className={mode==='password'?'tab active':'tab'} onClick={()=>setMode('password')}>Password</button>
            <button className={mode==='register'?'tab active':'tab'} onClick={()=>setMode('register')}>Register</button>
            <button className={mode==='otp'?'tab active':'tab'} onClick={()=>setMode('otp')}>OTP</button>
          </div>
          {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
          {mode==='password' && (
            <form onSubmit={handlePassword} className="form">
              <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
              <label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></label>
              <button disabled={loading} className="btn btn-dark btn-block">{loading?'Signing in...':'Sign In →'}</button>
              <p className="fine">Demo: vendor@shop.com / vendor123</p>
            </form>
          )}
          {mode==='register' && (
            <form onSubmit={handleRegister} className="form">
              <label>Name<input required value={regForm.name} onChange={e=>setRegForm({...regForm,name:e.target.value})} placeholder="Store Name" /></label>
              <label>Email<input type="email" required value={regForm.email} onChange={e=>setRegForm({...regForm,email:e.target.value})} /></label>
              <label>Phone<input value={regForm.phone} onChange={e=>setRegForm({...regForm,phone:e.target.value})} placeholder="9876543210" /></label>
              <label>Password<input type="password" required value={regForm.password} onChange={e=>setRegForm({...regForm,password:e.target.value})} placeholder="••••••••" /></label>
              <button disabled={loading} className="btn btn-dark btn-block">{loading?'Creating...':'Create Vendor Account →'}</button>
            </form>
          )}
          {mode==='otp' && (
            <div className="form">
              {otpStep==='request' ? (
                <form onSubmit={requestOtp}>
                  <label>Email or Phone<input required value={otpForm.identifier} onChange={e=>setOtpForm({...otpForm,identifier:e.target.value})} placeholder="email or 9876543210" /></label>
                  <button disabled={loading} className="btn btn-dark btn-block">{loading?'Sending...':'Send OTP'}</button>
                </form>
              ) : (
                <form onSubmit={verifyOtp}>
                  <label>OTP<input required value={otpForm.otp} onChange={e=>setOtpForm({...otpForm,otp:e.target.value})} placeholder="123456" /></label>
                  <button disabled={loading} className="btn btn-dark btn-block">{loading?'Verifying...':'Verify'}</button>
                  <button type="button" onClick={()=>setOtpStep('request')} className="btn btn-ghost btn-block">Back</button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
