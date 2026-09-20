import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
export default function Sidebar(){
  const {user, logout}=useAuth()
  const navigate=useNavigate()
  const handleLogout=()=>{ logout(); navigate('/login')}
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><span className="brand-mark">◆</span><span className="brand-name">VÉLORA</span><span className="brand-sub">VENDOR</span></div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({isActive})=>isActive?'nav-item active':'nav-item'}>Dashboard</NavLink>
        <NavLink to="/products" className={({isActive})=>isActive?'nav-item active':'nav-item'}>My Products</NavLink>
        <NavLink to="/orders" className={({isActive})=>isActive?'nav-item active':'nav-item'}>Orders</NavLink>
        <NavLink to="/analytics" className={({isActive})=>isActive?'nav-item active':'nav-item'}>Analytics</NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="user-mini"><strong>{user?.name}</strong><span>{user?.email}</span><span className="fine">Vendor ID: {user?.id.slice(0,8)}</span></div>
        <button onClick={handleLogout} className="btn btn-outline btn-block">Logout</button>
      </div>
    </aside>
  )
}
