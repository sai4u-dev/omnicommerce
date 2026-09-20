import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
export default function Analytics(){
  const [orders,setOrders]=useState([])
  const [products,setProducts]=useState([])
  useEffect(()=>{ (async()=>{
    try{
      const [o,p]=await Promise.all([apiFetch('/api/orders',{auth:true}), apiFetch('/api/products')])
      setOrders(o.orders); setProducts(p.products)
    }catch(e){console.error(e)}
  })()},[])
  const revenue=orders.reduce((s,o)=>s+o.total,0)
  const avgOrder=orders.length? (revenue/orders.length).toFixed(2):0
  const byStatus = orders.reduce((acc,o)=>{ acc[o.status]=(acc[o.status]||0)+1; return acc},{})
  return (
    <div className="page">
      <header className="page-header"><h1>Analytics</h1><p className="muted">Sales overview • Backend is single source of truth</p></header>
      <div className="stats-grid">
        <div className="stat-card"><span>Revenue (est)</span><strong>${revenue.toFixed(2)}</strong><em>{orders.length} orders</em></div>
        <div className="stat-card"><span>Avg Order</span><strong>${avgOrder}</strong><em>Value</em></div>
        <div className="stat-card"><span>Products</span><strong>{products.length}</strong><em>Catalog size</em></div>
        <div className="stat-card"><span>Low Stock</span><strong>{products.filter(p=>p.stock<10).length}</strong><em>Needs restock</em></div>
      </div>
      <div className="card">
        <h3>Orders by Status</h3>
        <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
          {Object.entries(byStatus).map(([k,v])=> <span key={k} className={`badge ${k}`}>{k}: {v}</span>)}
          {orders.length===0 && <span className="muted">No data</span>}
        </div>
      </div>
      <div className="card muted-card">Frontend polls <code>/api/orders</code> and <code>/api/stats</code>. For prod, add WebSocket / SSE for real-time.</div>
    </div>
  )
}
