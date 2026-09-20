import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

export default function Profile(){
  const {user}=useAuth()
  const [me,setMe]=useState(user)
  const [phone,setPhone]=useState(user?.phone || '')
  const [msg,setMsg]=useState(null)

  const save=async(e)=>{
    e.preventDefault()
    try{
      const data=await apiFetch('/api/auth/me',{method:'PUT', auth:true, body:{phone}})
      setMe(data.user)
      localStorage.setItem('delivery_user', JSON.stringify(data.user))
      setMsg({type:'success', text:'Saved'})
    }catch(err){ setMsg({type:'error', text:err.message})}
  }

  return (
    <div className="page">
      <header className="page-header"><h1>Profile</h1><p className="muted">Delivery partner details • Same /api/auth/me for all roles</p></header>
      <div className="card" style={{maxWidth:520}}>
        <p><strong>{me?.name}</strong> <span className="badge">{me?.role}</span></p>
        <p className="fine">{me?.email} • Joined {new Date(me?.createdAt).toLocaleDateString()}</p>
        {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
        <form onSubmit={save} className="form">
          <label>Phone<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="9876543210" /></label>
          <button className="btn btn-dark">Save</button>
        </form>
      </div>
      <div className="card muted-card">Mobile app stores credentials via <code>expo-secure-store</code> instead of localStorage — same API.</div>
    </div>
  )
}
