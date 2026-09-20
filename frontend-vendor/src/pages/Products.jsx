import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'
import { useAuth } from '../context/AuthContext'
export default function Products(){
  const {user}=useAuth()
  const [products,setProducts]=useState([])
  const [loading,setLoading]=useState(true)
  const [msg,setMsg]=useState(null)
  const [form,setForm]=useState({title:'', price:'', category:'women', brand:'', stock:'20', description:''})
  const [editId,setEditId]=useState(null)

  const load=async()=>{
    setLoading(true)
    try{ const d=await apiFetch('/api/products'); setProducts(d.products)}catch(e){setMsg(e.message)}
    finally{ setLoading(false)}
  }
  useEffect(()=>{load()},[])
  const myProducts = products.filter(p=>!p.vendorId || p.vendorId===user.id)

  const submit=async(e)=>{
    e.preventDefault()
    try{
      const payload={ title:form.title, price:Number(form.price), category:form.category, brand:form.brand||'Vendor', stock:Number(form.stock), description:form.description }
      if(editId){
        await apiFetch(`/api/products/${editId}`,{method:'PUT', auth:true, body:payload})
        setEditId(null)
      } else {
        await apiFetch('/api/products',{method:'POST', auth:true, body:payload})
      }
      setForm({title:'', price:'', category:'women', brand:'', stock:'20', description:''})
      setMsg({type:'success', text: editId?'Updated':'Created'})
      load()
    }catch(err){ setMsg({type:'error', text:err.message}) }
  }
  const startEdit=(p)=>{
    setEditId(p.id)
    setForm({title:p.title, price:String(p.price), category:p.category, brand:p.brand, stock:String(p.stock), description:p.description})
    window.scrollTo({top:0, behavior:'smooth'})
  }
  const remove=async(id)=>{
    if(!confirm('Delete?')) return
    try{ await apiFetch(`/api/products/${id}`,{method:'DELETE', auth:true}); load()}catch(e){ alert(e.message)}
  }

  return (
    <div className="page">
      <header className="page-header"><h1>My Products</h1><p className="muted">Your catalog • {myProducts.length} items • Total marketplace: {products.length}</p></header>
      {msg && <div className={`alert ${typeof msg==='string'?'error':msg.type}`}>{typeof msg==='string'?msg:msg.text}</div>}
      <form onSubmit={submit} className="card">
        <h3>{editId?'Edit Product':'Add Product'}</h3>
        <div className="form" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
          <label>Title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Saree — Silk Blend" /></label>
          <label>Price<input required type="number" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} /></label>
          <label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option value="women">women</option><option value="men">men</option><option value="kids">kids</option><option value="footwear">footwear</option><option value="accessories">accessories</option><option value="sale">sale</option></select></label>
          <label>Brand<input value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} /></label>
          <label>Stock<input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} /></label>
          <label style={{gridColumn:'1 / -1'}}>Description<input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Product details" /></label>
        </div>
        <div style={{marginTop:12, display:'flex', gap:8}}>
          <button className="btn btn-dark">{editId?'Update':'Create'} →</button>
          {editId && <button type="button" onClick={()=>{setEditId(null); setForm({title:'', price:'', category:'women', brand:'', stock:'20', description:''})}} className="btn btn-outline">Cancel</button>}
        </div>
      </form>

      <div className="card">
        <h3>Catalog</h3>
        {loading ? <p>Loading...</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Title</th><th>Cat</th><th>Price</th><th>Stock</th><th>Owner</th><th></th></tr></thead>
              <tbody>
                {products.map(p=>{
                  const mine = !p.vendorId || p.vendorId===user.id
                  return <tr key={p.id} style={{opacity: mine?1:0.6}}><td>{p.title.slice(0,40)}</td><td>{p.category}</td><td>${p.price}</td><td>{p.stock}</td><td>{mine ? 'You' : p.vendorId?.slice(0,6) || 'admin'}</td>
                    <td style={{display:'flex', gap:6}}>{mine && <><button className="btn btn-ghost" onClick={()=>startEdit(p)}>Edit</button><button className="btn btn-ghost" onClick={()=>remove(p.id)}>Delete</button></>}</td>
                  </tr>
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
