import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Dashboard(){
  const {user}=useAuth()
  const [orders,setOrders]=useState([])
  const [loading,setLoading]=useState(true)
  const [filter,setFilter]=useState('all') // all | pending | processing | shipped | delivered

  const load=async()=>{
    setLoading(true)
    try{
      const d=await apiFetch('/api/orders',{auth:true})
      setOrders(d.orders)
    }catch(e){ console.error(e)}
    finally{ setLoading(false)}
  }
  useEffect(()=>{ load() },[])

  const updateStatus=async(id,status)=>{
    try{
      await apiFetch(`/api/orders/${id}/status`,{method:'PATCH', auth:true, body:{status}})
      load()
    }catch(e){ alert(e.message)}
  }

  const myOrders = orders.filter(o=> !o.deliveryManId || o.deliveryManId===user.id)
  const filtered = filter==='all' ? myOrders : myOrders.filter(o=>o.status===filter)

  const stats={
    assigned: myOrders.length,
    pending: myOrders.filter(o=>o.status==='pending').length,
    shipped: myOrders.filter(o=>o.status==='shipped').length,
    delivered: myOrders.filter(o=>o.status==='delivered').length,
  }

  return (
    <div className="page">
      <header className="page-header"><h1>Deliveries</h1><p className="muted">Hello {user?.name} • Assigned & available orders • Update status on the go (Expo + Web)</p></header>
      <div className="stats-grid">
        <div className="stat-card"><span>Assigned</span><strong>{stats.assigned}</strong><em>Total visible</em></div>
        <div className="stat-card"><span>Pending</span><strong>{stats.pending}</strong><em>Awaiting pickup</em></div>
        <div className="stat-card"><span>Shipped</span><strong>{stats.shipped}</strong><em>In transit</em></div>
        <div className="stat-card"><span>Delivered</span><strong>{stats.delivered}</strong><em>Completed</em></div>
      </div>

      <div className="filter-pills">
        {['all','pending','processing','shipped','delivered'].map(f=> (
          <button key={f} className={filter===f?'pill active':'pill'} onClick={()=>setFilter(f)}>{f}</button>
        ))}
        <button className="btn btn-ghost" onClick={load}>Refresh</button>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
        <div style={{display:'grid', gap:14}}>
          {filtered.map(o=> (
            <div key={o.id} className="card" style={{display:'flex', flexDirection:'column', gap:10}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', flexWrap:'wrap', gap:10}}>
                <div>
                  <strong>Order #{o.id.slice(0,8)}</strong> <span className={`badge ${o.status}`}>{o.status}</span>
                  <div className="fine">{new Date(o.createdAt).toLocaleString()} • {o.userName} • {o.userEmail}</div>
                  <div style={{marginTop:6}}>{o.items.map(i=> <span key={i.productId} style={{display:'inline-flex', gap:6, alignItems:'center', border:'1px solid var(--line)', padding:'4px 8px', borderRadius:999, fontSize:12, marginRight:6, marginBottom:4}}><img src={i.image} alt="" style={{width:18,height:18,borderRadius:4,objectFit:'cover'}}/>{i.title.slice(0,22)} x{i.qty}</span>)}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontWeight:700}}>${o.total}</div>
                  <div className="fine">{o.shippingAddress?.address}, {o.shippingAddress?.city}</div>
                  <div className="fine">Pay: {o.paymentMethod}</div>
                </div>
              </div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                <button disabled={o.status==='shipped' || o.status==='delivered'} onClick={()=>updateStatus(o.id,'shipped')} className="btn btn-dark">Mark Shipped</button>
                <button disabled={o.status==='delivered'} onClick={()=>updateStatus(o.id,'delivered')} className="btn btn-outline">Mark Delivered</button>
                {o.status==='pending' && <button onClick={()=>updateStatus(o.id,'processing')} className="btn btn-ghost">Start Processing</button>}
                <button onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.shippingAddress?.address + ' ' + o.shippingAddress?.city)}`, '_blank')} className="btn btn-ghost">Navigate ↗</button>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div className="card empty">No {filter!=='all'?filter:''} deliveries. Wait for admin to assign or create test orders via User app.</div>}
        </div>
      )}
      <div className="card muted-card" style={{marginTop:16}}>
        <h4>Delivery Flow</h4>
        <p>Admin creates assignment via <code>POST /api/orders/:id/assign {'{deliveryManId}'}</code>. Delivery sees filtered list <code>GET /api/orders</code> (backend returns own + unassigned). Status updates via <code>PATCH /api/orders/:id/status</code>.</p>
        <p>Expo mobile app adds live location & push notifications (expo-location + expo-notifications) on top of same API.</p>
      </div>
    </div>
  )
}
