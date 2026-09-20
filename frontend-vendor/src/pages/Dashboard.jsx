import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'
export default function Dashboard(){
  const {user}=useAuth()
  const [stats,setStats]=useState(null)
  const [myProducts,setMyProducts]=useState([])
  const [orders,setOrders]=useState([])
  useEffect(()=>{
    (async()=>{
      try{
        const [s, p, o]=await Promise.all([
          apiFetch('/api/stats'),
          apiFetch('/api/products'),
          apiFetch('/api/orders',{auth:true})
        ])
        setStats(s)
        setMyProducts(p.products.filter(prod=>!prod.vendorId || prod.vendorId===user.id).slice(0,4))
        setOrders(o.orders.slice(0,5))
      }catch(e){console.error(e)}
    })()
  },[user])
  return (
    <div className="page">
      <header className="page-header"><h1>Welcome, {user?.name}</h1><p className="muted">Vendor studio • Manage catalog & orders • Mobile (Expo) + Desktop (Electron) share same backend</p></header>
      <div className="stats-grid">
        <div className="stat-card"><span>My Products</span><strong>{myProducts.length}</strong><em>of {stats?.products ?? 0} total</em></div>
        <div className="stat-card"><span>Orders</span><strong>{orders.length}</strong><em>Pipeline</em></div>
        <div className="stat-card"><span>Revenue</span><strong>${orders.reduce((s,o)=>s+o.total,0).toFixed(2)}</strong><em>Est. from listed</em></div>
        <div className="stat-card"><span>Status</span><strong>Active</strong><em>Vendor verified</em></div>
      </div>
      <div className="card">
        <h3>My Products Preview</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12}}>
          {myProducts.map(p=> (
            <div key={p.id} style={{border:'1px solid var(--line)', borderRadius:12, overflow:'hidden', background:'#fff'}}>
              <img src={p.images[0]} alt="" style={{height:140, width:'100%', objectFit:'cover'}} />
              <div style={{padding:10}}><strong style={{fontSize:13}}>{p.title.slice(0,36)}</strong><br/><span className="fine">${p.price} • {p.stock} in stock</span></div>
            </div>
          ))}
          {myProducts.length===0 && <p className="muted">No products yet. Create from “My Products”.</p>}
        </div>
      </div>
      <div className="card muted-card">
        <h4>Omnichannel</h4>
        <p>Web: <code>frontend-vendor :5175</code> • Mobile: <code>mobile-vendor Expo</code> (Android/iOS) • Desktop: <code>desktop-vendor Electron</code> • All write through <code>POST /api/products</code> with <code>vendorId</code> binding.</p>
        <p>Orders are shared: customers (User app) create orders, you see them here and update status. Delivery partner fulfills.</p>
      </div>
    </div>
  )
}
