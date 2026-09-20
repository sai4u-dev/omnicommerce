import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client'

export default function Products() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ title: '', price: '', category: 'women', brand: '', stock: '10' })
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)

  const load = async () => {
    setLoading(true)
    try { const d = await apiFetch('/api/products'); setProducts(d.products) } catch (e) { setMsg(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    try {
      await apiFetch('/api/products', { method: 'POST', auth: true, body: { title: form.title, price: Number(form.price), category: form.category, brand: form.brand || 'Vélora', stock: Number(form.stock) } })
      setForm({ title: '', price: '', category: 'women', brand: '', stock: '10' })
      setMsg({ type:'success', text:'Product created'})
      load()
    } catch (err) { setMsg({ type:'error', text: err.message })}
  }

  const remove = async (id) => {
    if (!confirm('Delete product?')) return
    try { await apiFetch(`/api/products/${id}`, { method: 'DELETE', auth:true }); load() } catch (e) { alert(e.message)}
  }

  return (
    <div className="page">
      <header className="page-header"><h1>Products</h1><p className="muted">Create, edit, delete • Vendor isolation enforced (vendor can only edit own)</p></header>
      {msg && <div className={`alert ${typeof msg==='string' ? 'error' : msg.type}`}>{typeof msg==='string' ? msg : msg.text}</div>}
      <form onSubmit={create} className="inline-form card">
        <h3>Add Product</h3>
        <div className="form-grid">
          <label>Title<input required value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Floral Dress" /></label>
          <label>Price<input required type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} placeholder="49.99" /></label>
          <label>Category<select value={form.category} onChange={e=>setForm({...form, category:e.target.value})}><option value="women">women</option><option value="men">men</option><option value="kids">kids</option><option value="footwear">footwear</option><option value="accessories">accessories</option><option value="sale">sale</option></select></label>
          <label>Brand<input value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} placeholder="Étoile" /></label>
          <label>Stock<input type="number" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})} /></label>
          <button className="btn btn-dark">Create</button>
        </div>
      </form>

      <div className="card">
        <h3>Catalog ({products.length})</h3>
        {loading ? <p>Loading...</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Title</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th></th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}><td>{p.title.slice(0,40)}</td><td>{p.category}</td><td>${p.price}</td><td>{p.stock}</td><td>{p.rating} ({p.reviewsCount})</td><td><button className="btn btn-ghost" onClick={()=>remove(p.id)}>Delete</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
