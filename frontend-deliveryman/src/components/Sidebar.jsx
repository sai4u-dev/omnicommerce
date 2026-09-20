import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
export default function Sidebar(){
  const {user,logout}=useAuth()
  const navigate=useNavigate()
  const handleLogout=()=>{ logout(); navigate('/login')}
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><span className="brand-mark">◆</span><span className="brand-name">VÉLORA</span><span className="brand-sub">DELIVERY</span></div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({isActive})=>isActive?'nav-item active':'nav-item'}>My Deliveries</NavLink>
        <NavLink to="/earnings" className={({isActive})=>isActive?'nav-item active':'nav-item'}>Earnings</NavLink>
        <NavLink to="/profile" className={({isActive})=>isActive?'nav-item active':'nav-item'}>Profile</NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="user-mini"><strong>{user?.name}</strong><span>{user?.email}</span></div>
        <button onClick={handleLogout} className="btn btn-outline btn-block">Logout</button>
      </div>
    </aside>
  )
}
