import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
export default function Earnings(){
  const [orders,setOrders]=useState([])
  useEffect(()=>{ (async()=>{ try{const d=await apiFetch('/api/orders',{auth:true}); setOrders(d.orders)}catch{}})()},[])
  const delivered=orders.filter(o=>o.status==='delivered')
  const revenue=delivered.reduce((s,o)=>s+o.total,0)
  const feePerOrder=5 // simulated
  const earnings=delivered.length * feePerOrder
  return (
    <div className="page">
      <header className="page-header"><h1>Earnings</h1><p className="muted">Simulated payout • $5 per delivery</p></header>
      <div className="stats-grid">
        <div className="stat-card"><span>Delivered</span><strong>{delivered.length}</strong><em>Orders</em></div>
        <div className="stat-card"><span>Earnings</span><strong>${earnings.toFixed(2)}</strong><em>Payout</em></div>
        <div className="stat-card"><span>Revenue Handled</span><strong>${revenue.toFixed(2)}</strong><em>Goods value</em></div>
        <div className="stat-card"><span>Success Rate</span><strong>{orders.length? Math.round(delivered.length/orders.length*100):0}%</strong><em>Delivered / Assigned</em></div>
      </div>
      <div className="card">
        <h3>Payout History</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Fee</th><th>Status</th></tr></thead>
            <tbody>
              {delivered.map(o=> <tr key={o.id}><td>#{o.id.slice(0,8)}</td><td>{new Date(o.updatedAt).toLocaleDateString()}</td><td>${o.total}</td><td>${feePerOrder}</td><td><span className="badge delivered">paid</span></td></tr>)}
              {delivered.length===0 && <tr><td colSpan={5} className="muted">No delivered orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
