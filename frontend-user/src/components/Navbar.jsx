import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../api/client'

export default function Navbar() {
  const { isAuthenticated, user, logout, loading, initialized } = useAuth()
  const navigate = useNavigate()
  const [cartCount, setCartCount] = useState(0)
  const [wishCount, setWishCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/', { replace: true })
  }

  // close dropdown on outside click / esc
  useEffect(() => {
    if (!menuOpen) return
    const onClickOutside = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    const onEsc = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('mousedown', onClickOutside); document.removeEventListener('keydown', onEsc) }
  }, [menuOpen])

  useEffect(() => {
    if (!isAuthenticated) { setCartCount(0); setWishCount(0); return }
    let mounted = true
    const load = async () => {
      try {
        const [c, w] = await Promise.all([
          apiFetch('/api/cart', { auth: true }).catch(() => ({ count: 0 })),
          apiFetch('/api/wishlist', { auth: true }).catch(() => ({ wishlist: [] }))
        ])
        if (!mounted) return
        setCartCount(c.count || 0)
        setWishCount((w.wishlist || []).length)
      } catch {}
    }
    load()
    const id = setInterval(load, 5000)
    const onUpdate = () => load()
    window.addEventListener('cart:updated', onUpdate)
    window.addEventListener('wishlist:updated', onUpdate)
    window.addEventListener('auth:login', onUpdate)
    window.addEventListener('auth:logout', () => { setCartCount(0); setWishCount(0) })
    return () => { mounted = false; clearInterval(id); window.removeEventListener('cart:updated', onUpdate); window.removeEventListener('wishlist:updated', onUpdate); window.removeEventListener('auth:login', onUpdate) }
  }, [isAuthenticated])

  // avoid flash of login/signup while verifying session
  const showAuthActions = !loading && initialized && !isAuthenticated
  const showUserActions = !loading && initialized && isAuthenticated

  const displayName = user?.name || user?.email?.split('@')[0] || 'Account'
  const avatarLetter = displayName.charAt(0).toUpperCase()

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to={isAuthenticated ? '/home' : '/'} className="brand">
          <span className="brand-mark">◆</span>
          <span className="brand-name">VÉLORA</span>
          <span className="brand-sub">FASHION HOUSE</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">LANDING</Link>
          {isAuthenticated && <Link to="/home" className="nav-link">SHOP</Link>}
          <a href="#collections" className="nav-link hide-m">COLLECTIONS</a>
        </div>

        <div className="nav-actions">
          {showUserActions ? (
            <>
              <Link to="/cart" className="nav-link" title="Bag" style={{ position: 'relative' }}>
                Bag {cartCount > 0 && <span className="badge" style={{ marginLeft: 6, background: 'var(--ink)', color: '#fff', borderColor: 'transparent', padding: '2px 7px', fontSize: 11 }}>{cartCount}</span>}
              </Link>
              <Link to="/wishlist" className="nav-link" title="Wishlist" style={{ position: 'relative' }}>
                ♡ {wishCount > 0 && <span className="badge" style={{ marginLeft: 4 }}>{wishCount}</span>}
              </Link>
              <Link to="/orders" className="nav-link hide-m">Orders</Link>

              {/* User menu — replaces Login/Signup when authenticated */}
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 6px', borderRadius: 999 }}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  title={user?.email}
                >
                  <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--ink)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>{avatarLetter}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
                  <span style={{ fontSize: 10, opacity: .6 }}>{menuOpen ? '▲' : '▼'}</span>
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', minWidth: 220, background: '#fff', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: 8, zIndex: 40 }}
                  >
                    <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--line)', marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>{user?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', wordBreak: 'break-all' }}>{user?.email}</div>
                      {user?.phone && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user.phone}</div>}
                    </div>
                    <Link to="/orders" onClick={() => setMenuOpen(false)} role="menuitem" style={{ display: 'block', padding: '8px 10px', borderRadius: 8, textDecoration: 'none', fontSize: 13, color: 'var(--ink)' }}>My Orders</Link>
                    <Link to="/wishlist" onClick={() => setMenuOpen(false)} role="menuitem" style={{ display: 'block', padding: '8px 10px', borderRadius: 8, textDecoration: 'none', fontSize: 13, color: 'var(--ink)' }}>Wishlist</Link>
                    <Link to="/cart" onClick={() => setMenuOpen(false)} role="menuitem" style={{ display: 'block', padding: '8px 10px', borderRadius: 8, textDecoration: 'none', fontSize: 13, color: 'var(--ink)' }}>Bag ({cartCount})</Link>
                    <div style={{ height: 1, background: 'var(--line)', margin: '6px 0' }} />
                    <button onClick={handleLogout} role="menuitem" style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : showAuthActions ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-dark">Create Account</Link>
            </>
          ) : (
            // loading state to prevent flash
            <span className="nav-link" style={{ opacity: .5 }}>…</span>
          )}
        </div>
      </div>
    </nav>
  )
}
