import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
          {isAuthenticated ? (
            <>
              <span className="nav-user">{user?.name?.split(' ')[0] || 'Account'}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
              <Link to="/home" className="btn btn-dark">Shop Now</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-dark">Create Account</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
