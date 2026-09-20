import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ (async()=>{ try{ const d=await apiFetch('/api/users',{auth:true}); setUsers(d.users)} catch(e){console.error(e)} finally{setLoading(false)}})() },[])
  return (
    <div className="page">
      <header className="page-header"><h1>Users</h1><p className="muted">All roles: user / vendor / delivery / admin • Created via register & OTP</p></header>
      <div className="card">
        {loading ? <p>Loading...</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Created</th></tr></thead>
              <tbody>
                {users.map(u=> <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.phone || '—'}</td><td><span className="badge">{u.role}</span></td><td>{new Date(u.createdAt).toLocaleDateString()}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="fine">Tip: Create vendor/delivery accounts via <code>POST /api/auth/register {`{name,email,password,phone,role}`}</code>. Vendor: vendor@shop.com / vendor123, Delivery: delivery@shop.com / delivery123</p>
    </div>
  )
}
