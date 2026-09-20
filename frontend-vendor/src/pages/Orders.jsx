import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
export default function Orders(){
  const [orders,setOrders]=useState([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{ (async()=>{ try{const d=await apiFetch('/api/orders',{auth:true}); setOrders(d.orders)}catch(e){console.error(e)} finally{setLoading(false)}})() },[])
  const updateStatus=async(id,status)=>{
    try{ await apiFetch(`/api/orders/${id}/status`,{method:'PATCH', auth:true, body:{status}}); const d=await apiFetch('/api/orders',{auth:true}); setOrders(d.orders)}catch(e){alert(e.message)}
  }
  return (
    <div className="page">
      <header className="page-header"><h1>Orders</h1><p className="muted">Fulfill customer orders • Update status to processing/shipped • Delivery will handle final delivery</p></header>
      <div className="card">
        {loading? <p>Loading...</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {orders.map(o=> (
                  <tr key={o.id}><td>{o.id.slice(0,8)}</td><td>{o.userName}<br/><span className="fine">{o.userEmail}</span></td><td>{o.items.map(i=>`${i.title.slice(0,20)} x${i.qty}`).join(', ')}</td><td>${o.total}</td><td><span className={`badge ${o.status}`}>{o.status}</span></td>
                  <td>
                    <select onChange={e=>e.target.value && updateStatus(o.id, e.target.value)} defaultValue="">
                      <option value="">Set status</option>
                      <option value="processing">processing</option><option value="shipped">shipped</option><option value="cancelled">cancelled</option>
                    </select>
                  </td>
                  </tr>
                ))}
                {orders.length===0 && <tr><td colSpan={6} className="muted">No orders yet. Customers create via User app /api/orders</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
