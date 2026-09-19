import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || 'all'
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('featured')

  useEffect(() => {
    async function load() {
      try {
        const c = await apiFetch('/api/categories')
        setCategories(c.categories || [])
      } catch {}
      try {
        setLoading(true)
        const q = new URLSearchParams()
        if (category !== 'all') q.set('category', category)
        if (search) q.set('search', search)
        if (sort === 'price_asc' || sort === 'price_desc' || sort === 'rating') q.set('sort', sort)
        if (sort === 'featured') q.set('featured', 'true')
        const data = await apiFetch(`/api/products?${q.toString()}`)
        setProducts(data.products || [])
      } catch (e) {
        console.error(e)
      } finally { setLoading(false) }
    }
    load()
  }, [category, search, sort])

  const handleSearch = (e) => { e.preventDefault(); /* already reactive via search state */ }

  return (
    <>
      <Navbar />
      <div className="home">
        <header className="home-header">
          <div>
            <p className="eyebrow">WELCOME BACK{user ? `, ${user.name.split(' ')[0].toUpperCase()}` : ''}</p>
            <h1>Discover your <em>next favourite</em> look</h1>
            <p className="muted">Hand-picked fashion essentials, new drops daily. {products.length} pieces waiting.</p>
          </div>
          <div className="header-actions">
            <form onSubmit={handleSearch} className="search-bar">
              <input placeholder="Search dresses, shirts, jeans..." value={search} onChange={e => setSearch(e.target.value)} />
              <button type="submit">⌕</button>
            </form>
            <select value={sort} onChange={e => setSort(e.target.value)} className="sort-select">
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </header>

        <div className="filter-pills">
          <button className={category === 'all' ? 'pill active' : 'pill'} onClick={() => setSearchParams({})}>All</button>
          {categories.map(c => (
            <button key={c.slug} className={category === c.slug ? 'pill active' : 'pill'} onClick={() => setSearchParams({ category: c.slug })}>
              {c.name}
            </button>
          ))}
        </div>

        {/* promo strip */}
        <div className="promo-strip">
          <span>✦ Extra 20% off on first order with code WELCOME20</span>
          <span>Free shipping on orders over ₹999</span>
          <span>30-day free returns</span>
        </div>

        {loading ? (
          <div className="grid-skeleton">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="empty">No products found matching your filter.</div>
        ) : (
          <div className="product-grid">
            {products.map(p => (
              <div key={p.id} className="product-card">
                <div className="product-img-wrap">
                  <img src={p.images?.[0]} alt={p.title} loading="lazy" />
                  {p.originalPrice > p.price && <span className="discount">-{Math.round((1 - p.price / p.originalPrice) * 100)}%</span>}
                  {p.isFeatured && <span className="featured-badge">FEATURED</span>}
                  <button className="wishlist-btn" title="Wishlist">♡</button>
                </div>
                <div className="product-info">
                  <p className="product-brand">{p.brand}</p>
                  <h3 className="product-title">{p.title}</h3>
                  <div className="product-meta">
                    <span className="stars">★ {p.rating}</span>
                    <span className="reviews">({p.reviewsCount})</span>
                    <span className="stock">{p.stock} left</span>
                  </div>
                  <div className="price-row">
                    <span className="price">₹{p.price}</span>
                    {p.originalPrice > p.price && <span className="original">₹{p.originalPrice}</span>}
                    <button className="add-btn">Add to Bag</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="home-editorial">
          <div>
            <h2>Styling tip from <em>VÉLORA Studio</em></h2>
            <p>Pair the Pleated Midi Skirt with an oversized sweater and loafers for an effortless Parisian look. Add gold hoops to catch the light.</p>
            <Link to="/?category=women" className="btn btn-dark">Shop Women's Wear</Link>
          </div>
          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80" alt="Style" />
        </section>

        <footer className="home-footer">
          <p>Logged in as <strong>{user?.email}</strong> {user?.phone && `• ${user.phone}`} • <Link to="/" >Go to Landing</Link> • <button className="link" onClick={logout}>Logout</button></p>
        </footer>
      </div>
    </>
  )
}
