import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiFetch } from '../api/client'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [qty, setQty] = useState(1)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [msg, setMsg] = useState(null)
  const [wished, setWished] = useState(false)

  const load = async () => {
    try {
      const p = await apiFetch(`/api/products/${id}`)
      setProduct(p.product)
      const r = await apiFetch(`/api/products/${id}/reviews`)
      setReviews(r.reviews || [])
      // check wishlist
      try {
        const w = await apiFetch('/api/wishlist', { auth: true })
        setWished((w.wishlist || []).some(x => x.id === id))
      } catch {}
    } catch (e) { setMsg(e.message) }
  }
  useEffect(() => { load() }, [id])

  const addToCart = async () => {
    try {
      await apiFetch('/api/cart', { method: 'POST', auth: true, body: { productId: id, qty } })
      setMsg({ type: 'success', text: `Added ${qty} to bag` })
    } catch (e) { setMsg({ type: 'error', text: e.message }); if (e.status === 401) navigate('/login') }
  }
  const toggleWishlist = async () => {
    try {
      const r = await apiFetch(`/api/wishlist/${id}`, { method: 'POST', auth: true })
      setWished(r.action === 'added')
      setMsg({ type: 'success', text: r.action === 'added' ? 'Saved to wishlist' : 'Removed from wishlist' })
    } catch (e) { setMsg({ type: 'error', text: e.message }); if (e.status === 401) navigate('/login') }
  }
  const submitReview = async (e) => {
    e.preventDefault()
    try {
      const r = await apiFetch(`/api/products/${id}/reviews`, { method: 'POST', auth: true, body: { rating, comment } })
      setReviews(prev => [r.review, ...prev])
      setComment('')
      setMsg({ type: 'success', text: 'Review posted — rating recalculated' })
      // reload product to get new rating
      const p = await apiFetch(`/api/products/${id}`)
      setProduct(p.product)
    } catch (e) { setMsg({ type: 'error', text: e.message }) }
  }

  if (!product) return <><Navbar /><div className="loading-screen"><div className="spinner" /><p>Loading product…</p></div></>
  return (
    <>
      <Navbar />
      <div className="home" style={{ maxWidth: 1100 }}>
        {msg && <div className={`alert ${typeof msg === 'string' ? 'error' : msg.type}`}>{typeof msg === 'string' ? msg : msg.text}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--bg-soft)', border: '1px solid var(--line)' }}>
              <img src={product.images?.[0]} alt={product.title} style={{ width: '100%', height: 520, objectFit: 'cover' }} />
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {product.images.map((img, i) => <img key={i} src={img} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--line)' }} />)}
              </div>
            )}
          </div>
          <div>
            <p className="product-brand" style={{ letterSpacing: '.14em' }}>{product.brand} • {product.category}</p>
            <h1 style={{ fontFamily: 'var(--display)', fontSize: 32, margin: '6px 0' }}>{product.title}</h1>
            <div className="product-meta" style={{ marginBottom: 10 }}>
              <span className="stars">★ {product.rating}</span>
              <span>({reviews.length} reviews)</span>
              <span className="stock">{product.stock} in stock</span>
              {product.isFeatured && <span className="badge">Featured</span>}
            </div>
            <p className="muted" style={{ lineHeight: 1.6 }}>{product.description}</p>
            <div className="price-row" style={{ margin: '14px 0', alignItems: 'center' }}>
              <span className="price" style={{ fontSize: 26 }}>₹{product.price}</span>
              {product.originalPrice > product.price && <>
                <span className="original" style={{ fontSize: 16 }}>₹{product.originalPrice}</span>
                <span className="discount" style={{ position: 'static' }}>-{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF</span>
              </>}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', border: '1px solid var(--line)', borderRadius: 999, padding: '4px 8px', background: '#fff' }}>
                <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
              </div>
              <button className="btn btn-dark" onClick={addToCart}>Add to Bag — ₹{(product.price * qty).toFixed(2)}</button>
              <button className={`btn ${wished ? 'btn-dark' : 'btn-outline'}`} onClick={toggleWishlist}>{wished ? '♥ Saved' : '♡ Wishlist'}</button>
            </div>
            <div className="card" style={{ padding: 12, display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
              <span className="badge">Free shipping over ₹999</span>
              <span className="badge">COD available</span>
              <span className="badge">30-day returns</span>
              <span className="badge">Secure by Fastify backend</span>
            </div>
            <Link to="/cart" className="btn btn-outline btn-block" style={{ marginTop: 10 }}>Go to Bag →</Link>
            <Link to="/home" className="fine" style={{ display: 'block', marginTop: 8, textAlign: 'center' }}>← Back to shop</Link>
          </div>
        </div>

        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: 24 }}>Reviews — {product.rating} ★ ({reviews.length})</h2>
          <form onSubmit={submitReview} className="card" style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            <h3 style={{ margin: 0 }}>Write a review</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label>Rating<select value={rating} onChange={e => setRating(Number(e.target.value))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)' }}>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
              </select></label>
              <input placeholder="Your review..." value={comment} onChange={e => setComment(e.target.value)} style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)' }} />
              <button className="btn btn-dark">Post</button>
            </div>
            <p className="fine">Backend recalculates product.rating avg and reviewsCount on every post. Auth required — same API for Web, Expo & Electron.</p>
          </form>
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {reviews.map(r => (
              <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <strong>{r.userName}</strong> <span className="fine">— {new Date(r.createdAt).toLocaleDateString()}</span>
                  <div style={{ color: 'var(--ink)', fontWeight: 600 }}>★ {r.rating}</div>
                  <p className="muted" style={{ margin: '6px 0 0' }}>{r.comment || '—'}</p>
                </div>
              </div>
            ))}
            {reviews.length === 0 && <p className="muted">No reviews yet. Be the first!</p>}
          </div>
        </section>
      </div>
    </>
  )
}
