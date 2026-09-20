import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiFetch } from '../api/client'

export default function Wishlist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/wishlist', { auth: true })
      setItems(data.wishlist || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const toggle = async (id) => {
    await apiFetch(`/api/wishlist/${id}`, { method: 'POST', auth: true })
    load()
  }
  const addToCart = async (id) => {
    try {
      await apiFetch('/api/cart', { method: 'POST', auth: true, body: { productId: id, qty: 1 } })
      alert('Added to bag')
    } catch (e) { alert(e.message) }
  }

  if (loading) return <><Navbar /><div className="loading-screen"><div className="spinner" /></div></>
  return (
    <>
      <Navbar />
      <div className="home" style={{ maxWidth: 1100 }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 32 }}>Wishlist — {items.length} saved</h1>
        <p className="muted">Your curated collection. Toggle heart on any product to save. Syncs across Web, Expo & Desktop via single backend.</p>
        {items.length === 0 ? (
          <div className="empty">
            <p>No saved items. Explore <Link to="/home">Shop</Link> and tap ♡.</p>
          </div>
        ) : (
          <div className="product-grid" style={{ marginTop: 16 }}>
            {items.map(p => (
              <div key={p.id} className="product-card">
                <div className="product-img-wrap">
                  <img src={p.images?.[0]} alt={p.title} />
                  <button className="wishlist-btn" style={{ background: 'var(--ink)', color: '#fff' }} onClick={() => toggle(p.id)} title="Remove">♥</button>
                  {p.originalPrice > p.price && <span className="discount">-{Math.round((1 - p.price / p.originalPrice) * 100)}%</span>}
                </div>
                <div className="product-info">
                  <p className="product-brand">{p.brand}</p>
                  <h3 className="product-title">{p.title}</h3>
                  <div className="price-row">
                    <span className="price">₹{p.price}</span>
                    {p.originalPrice > p.price && <span className="original">₹{p.originalPrice}</span>}
                    <button className="add-btn" onClick={() => addToCart(p.id)}>Add to Bag</button>
                  </div>
                  <Link to={`/product/${p.id}`} className="btn btn-ghost" style={{ marginTop: 6, fontSize: 12 }}>View details →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
