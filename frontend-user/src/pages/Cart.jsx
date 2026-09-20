import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiFetch } from '../api/client'

export default function Cart() {
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/cart', { auth: true })
      setCart(data)
    } catch (e) {
      setMsg(e.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const updateQty = async (productId, qty) => {
    if (qty < 1) return
    try {
      await apiFetch(`/api/cart/${productId}`, { method: 'PUT', auth: true, body: { qty } })
      load()
    } catch (e) { alert(e.message) }
  }

  const remove = async (productId) => {
    try {
      await apiFetch(`/api/cart/${productId}`, { method: 'DELETE', auth: true })
      load()
    } catch (e) { alert(e.message) }
  }

  const clear = async () => {
    if (!confirm('Clear cart?')) return
    await apiFetch('/api/cart', { method: 'DELETE', auth: true })
    load()
  }

  if (loading) return <><Navbar /><div className="loading-screen"><div className="spinner" /><p>Loading bag…</p></div></>
  const items = cart.items || []

  return (
    <>
      <Navbar />
      <div className="home" style={{ maxWidth: 900 }}>
        <header className="page-header" style={{ marginBottom: 16 }}>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 32 }}>Your Bag — {cart.count} items</h1>
          <p className="muted">Review items, adjust quantity, then checkout. Single backend powers Web, Expo & Desktop.</p>
          {msg && <div className="alert error">{msg}</div>}
        </header>

        {items.length === 0 ? (
          <div className="empty">
            <p>Your bag is empty. Discover looks on <Link to="/home">Shop</Link>.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: 12 }}>
              {items.map(({ product, productId, qty }) => (
                <div key={productId} className="card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <img src={product?.images?.[0]} alt={product?.title} style={{ width: 90, height: 110, objectFit: 'cover', borderRadius: 12, background: 'var(--bg-soft)' }} />
                  <div style={{ flex: 1 }}>
                    <p className="product-brand">{product?.brand}</p>
                    <h3 className="product-title" style={{ margin: '4px 0' }}>{product?.title}</h3>
                    <div className="price-row" style={{ marginBottom: 6 }}>
                      <span className="price">₹{product?.price}</span>
                      {product?.originalPrice > product?.price && <span className="original">₹{product?.originalPrice}</span>}
                      <span className="fine">Stock: {product?.stock}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => updateQty(productId, qty - 1)} disabled={qty <= 1}>−</button>
                      <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                      <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => updateQty(productId, qty + 1)} disabled={qty >= (product?.stock || 99)}>+</button>
                      <button className="btn btn-ghost" onClick={() => remove(productId)}>Remove</button>
                      <Link to={`/product/${productId}`} className="btn btn-ghost">View</Link>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 90 }}>
                    <strong>₹{(product?.price * qty).toFixed(2)}</strong>
                    <div className="fine">qty {qty}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginTop: 16, display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: '.14em', color: 'var(--muted)', fontWeight: 600 }}>ESTIMATED TOTAL</div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>₹{cart.total?.toFixed(2) || '0.00'}</div>
                  <div className="fine">Free shipping over ₹999 • 30-day returns</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline" onClick={clear}>Clear Bag</button>
                  <Link to="/home" className="btn btn-outline">Continue Shopping</Link>
                  <button className="btn btn-dark" onClick={() => navigate('/checkout')}>Checkout →</button>
                </div>
              </div>
              <div className="promo-strip" style={{ margin: 0 }}>
                <span>Use WELCOME20 for 20% off your first order</span>
                <span>Secure checkout powered by single Fastify backend</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
