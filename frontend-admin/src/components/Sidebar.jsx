import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">◆</span>
        <span className="brand-name">VÉLORA</span>
        <span className="brand-sub">ADMIN</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Dashboard</NavLink>
        <NavLink to="/products" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Products</NavLink>
        <NavLink to="/orders" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Orders</NavLink>
        <NavLink to="/users" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Users</NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="user-mini">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>
        <button onClick={handleLogout} className="btn btn-outline btn-block">Logout</button>
        <p className="fine" style={{marginTop:8}}>Single Backend: {import.meta.env.VITE_API_URL || 'http://localhost:5000'}</p>
      </div>
    </aside>
  )
}
