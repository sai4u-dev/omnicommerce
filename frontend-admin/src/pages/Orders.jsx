import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [o, u] = await Promise.all([
        apiFetch('/api/orders', { auth:true }),
        apiFetch('/api/users', { auth:true }).catch(()=>({users:[]}))
      ])
      setOrders(o.orders || [])
      setUsers(u.users || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(()=>{ load() },[])

  const updateStatus = async (id, status) => {
    try { await apiFetch(`/api/orders/${id}/status`, { method:'PATCH', auth:true, body:{ status } }); load() } catch(e){ alert(e.message)}
  }
  const assign = async (orderId, deliveryManId) => {
    try { await apiFetch(`/api/orders/${orderId}/assign`, { method:'POST', auth:true, body:{ deliveryManId } }); load() } catch(e){ alert(e.message)}
  }

  const deliveryMen = users.filter(u=>u.role==='delivery')

  return (
    <div className="page">
      <header className="page-header"><h1>Orders</h1><p className="muted">Manage pipeline: pending → processing → shipped → delivered • Assign delivery personnel</p></header>
      {loading ? <p>Loading...</p> : (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Delivery</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.length ? orders.map(o => (
                  <tr key={o.id}>
                    <td>{o.id.slice(0,8)}</td>
                    <td>{o.userName}<br/><span className="fine">{o.userEmail}</span></td>
                    <td>{o.items.length}</td>
                    <td>${o.total}</td>
                    <td><span className={`badge ${o.status}`}>{o.status}</span></td>
                    <td>{o.deliveryManId ? o.deliveryManId.slice(0,6) : '—'}</td>
                    <td style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                      <select onChange={e=>e.target.value && updateStatus(o.id, e.target.value)} defaultValue="">
                        <option value="">Set status</option>
                        <option value="processing">processing</option><option value="shipped">shipped</option><option value="delivered">delivered</option><option value="cancelled">cancelled</option>
                      </select>
                      {deliveryMen.length ? (
                        <select onChange={e=>e.target.value && assign(o.id, e.target.value)} defaultValue="">
                          <option value="">Assign delivery</option>
                          {deliveryMen.map(d=> <option key={d.id} value={d.id}>{d.name} ({d.email})</option>)}
                        </select>
                      ) : null}
                    </td>
                  </tr>
                )) : <tr><td colSpan={7} className="muted">No orders</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="fine">Delivery app (Web 5176 + Expo) will see assigned orders via <code>GET /api/orders</code> filtered by deliveryManId.</p>
    </div>
  )
}
