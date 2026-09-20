import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiFetch } from '../api/client'

const statusColor = {
  pending: '#9A3412',
  processing: '#1E40AF',
  shipped: '#0C4A6E',
  delivered: '#065F46',
  cancelled: '#991B1B'
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/orders', { auth: true })
      setOrders(data.orders || [])
    } catch (e) { setMsg(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const cancel = async (id) => {
    if (!confirm('Cancel this order? Only pending orders can be cancelled.')) return
    try {
      await apiFetch(`/api/orders/${id}/status`, { method: 'PATCH', auth: true, body: { status: 'cancelled' } })
      load()
    } catch (e) { alert(e.message) }
  }

  if (loading) return <><Navbar /><div className="loading-screen"><div className="spinner" /></div></>
  return (
    <>
      <Navbar />
      <div className="home" style={{ maxWidth: 900 }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 32 }}>My Orders — {orders.length}</h1>
        <p className="muted">Track from pending → processing → shipped → delivered. Delivery partner updates via same <code>/api/orders/:id/status</code>. Admin can assign delivery.</p>
        {msg && <div className="alert error">{msg}</div>}
        {orders.length === 0 ? (
          <div className="empty">
            <p>No orders yet. Add to bag and checkout.</p>
            <Link to="/home" className="btn btn-dark">Shop now</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
            {orders.map(o => (
              <div key={o.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong>Order #{o.id.slice(0, 8)}</strong>
                    <span className="badge" style={{ marginLeft: 8, background: statusColor[o.status] || '#eee', color: '#fff', borderColor: 'transparent' }}>{o.status}</span>
                    <div className="fine">{new Date(o.createdAt).toLocaleString()} • {o.paymentMethod} • Delivery: {o.deliveryManId ? o.deliveryManId.slice(0, 6) : 'Unassigned'}</div>
                    <div className="fine">{o.shippingAddress?.address}, {o.shippingAddress?.city} {o.shippingAddress?.zip}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>₹{o.total}</div>
                    <div className="fine">{o.items.length} items</div>
                    {o.status === 'pending' && <button className="btn btn-outline" style={{ marginTop: 6, fontSize: 12 }} onClick={() => cancel(o.id)}>Cancel</button>}
                  </div>
                </div>
                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  {o.items.map(it => (
                    <div key={it.productId} style={{ display: 'flex', gap: 10, alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                      <img src={it.image} alt={it.title} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, background: 'var(--bg-soft)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{it.title}</div>
                        <div className="fine">Qty {it.qty} × ₹{it.price}</div>
                      </div>
                      <strong>₹{(it.price * it.qty).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['pending','processing','shipped','delivered','cancelled'].map(s => (
                    <span key={s} className="badge" style={{ opacity: o.status === s ? 1 : 0.35, background: o.status === s ? statusColor[s] : 'var(--bg-soft)', color: o.status === s ? '#fff' : 'var(--muted)', borderColor: o.status === s ? 'transparent' : 'var(--line)' }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
