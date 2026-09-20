import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiFetch } from '../api/client'

export default function Checkout() {
  const navigate = useNavigate()
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [msg, setMsg] = useState(null)
  const [address, setAddress] = useState({ address: 'Bandra West, Mumbai', city: 'Mumbai', zip: '400050', country: 'India', phone: '' })
  const [paymentMethod, setPaymentMethod] = useState('COD') // COD | Stripe | UPI
  const [card, setCard] = useState({ number: '4242 4242 4242 4242', exp: '12/28', cvv: '123' })

  useEffect(() => {
    (async () => {
      try {
        const c = await apiFetch('/api/cart', { auth: true })
        setCart(c)
        if (c.count === 0) setMsg({ type: 'error', text: 'Cart is empty — add items before checkout' })
        // preload phone from profile
        try {
          const me = await apiFetch('/api/auth/me', { auth: true })
          if (me.user.phone) setAddress(a => ({ ...a, phone: me.user.phone }))
        } catch {}
      } catch (e) { setMsg({ type: 'error', text: e.message }) }
      finally { setLoading(false) }
    })()
  }, [])

  const placeOrder = async (e) => {
    e.preventDefault()
    if (cart.count === 0) return setMsg({ type: 'error', text: 'Bag empty' })
    if (!address.address || !address.city) return setMsg({ type: 'error', text: 'Address & city required' })
    setPlacing(true); setMsg(null)
    try {
      // Stripe mock via single backend — create PaymentIntent then confirm (see backend/src/routes/payments.js)
      if (paymentMethod === 'Stripe') {
        if (card.number.replace(/\s/g, '').endsWith('0000')) throw new Error('Stripe: card declined (mock). Use 4242... for success')
        const intent = await apiFetch('/api/payments/stripe/intent', { method: 'POST', auth: true, body: { amount: Math.round(cart.total * 100), currency: 'inr' } })
        const last4 = card.number.replace(/\s/g, '').slice(-4)
        await apiFetch('/api/payments/stripe/confirm', { method: 'POST', auth: true, body: { paymentIntentId: intent.id, cardLast4: last4 } })
        // in prod: stripe.confirmCardPayment(intent.clientSecret)
      }
      const res = await apiFetch('/api/orders', {
        method: 'POST', auth: true,
        body: { shippingAddress: address, paymentMethod, items: undefined } // undefined → backend uses cart
      })
      window.dispatchEvent(new Event('cart:updated'))
      setMsg({ type: 'success', text: `Order ${res.order.id.slice(0, 8)} placed — ${paymentMethod} — ₹${res.order.total}` })
      setTimeout(() => navigate('/orders'), 1200)
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally { setPlacing(false) }
  }

  if (loading) return <><Navbar /><div className="loading-screen"><div className="spinner" /></div></>
  return (
    <>
      <Navbar />
      <div className="home" style={{ maxWidth: 1100 }}>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 32 }}>Checkout</h1>
        <p className="muted">COD or Stripe mock • Single backend <code>POST /api/orders</code> decrements stock, clears cart, works for Web, Expo & Electron.</p>
        {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 16, alignItems: 'start', marginTop: 16 }}>
          <form onSubmit={placeOrder} className="card" style={{ display: 'grid', gap: 12 }}>
            <h3 style={{ margin: 0 }}>Shipping address</h3>
            <label className="form" style={{ gap: 6 }}>Address<input required value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} placeholder="Street, area" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)' }} /></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <label className="form">City<input required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)' }} /></label>
              <label className="form">ZIP<input value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)' }} /></label>
              <label className="form">Phone<input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="9876543210" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)' }} /></label>
            </div>
            <label className="form">Country<input value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)' }} /></label>

            <h3 style={{ margin: '8px 0 0' }}>Payment method</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {[
                { id: 'COD', label: 'Cash on Delivery — Pay when delivered', desc: 'No online payment now. Backend sets paymentMethod=COD.' },
                { id: 'Stripe', label: 'Stripe (mock) — Card', desc: 'Mock Stripe. Use 4242 4242 4242 4242 succeeds, 0000 fails. In prod replace with @stripe/stripe-js confirm.' },
                { id: 'UPI', label: 'UPI (mock)', desc: 'Mock UPI — instant success.' },
              ].map(m => (
                <label key={m.id} style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 12, border: `1px solid ${paymentMethod === m.id ? 'var(--ink)' : 'var(--line)'}`, background: paymentMethod === m.id ? 'var(--bg-soft)' : '#fff', cursor: 'pointer' }}>
                  <input type="radio" name="pm" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} />
                  <div><strong>{m.label}</strong><div className="fine">{m.desc}</div></div>
                </label>
              ))}
            </div>

            {paymentMethod === 'Stripe' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr .7fr .7fr', gap: 8, padding: 12, background: 'var(--bg-soft)', borderRadius: 12, border: '1px solid var(--line)' }}>
                <label className="form">Card number<input value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" /></label>
                <label className="form">Exp<input value={card.exp} onChange={e => setCard({ ...card, exp: e.target.value })} placeholder="12/28" /></label>
                <label className="form">CVV<input value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value })} placeholder="123" /></label>
                <span className="fine" style={{ gridColumn: '1 / -1' }}>This is a mock — no real Stripe call. Replace with `stripe.confirmCardPayment(clientSecret)` in prod.</span>
              </div>
            )}

            <button disabled={placing || cart.count === 0} className="btn btn-dark btn-block" style={{ padding: '14px 20px', fontSize: 16 }}>
              {placing ? 'Placing order…' : `Pay ${paymentMethod === 'COD' ? 'on delivery' : 'now'} — ₹${cart.total?.toFixed(2) || '0.00'}`}
            </button>
            <p className="fine">By placing order you agree to 30-day returns and stock is checked server-side. Delivery partner will be assigned by Admin.</p>
          </form>

          <div className="card" style={{ position: 'sticky', top: 16 }}>
            <h3 style={{ marginTop: 0 }}>Order summary — {cart.count} items</h3>
            <div style={{ display: 'grid', gap: 10, maxHeight: 380, overflow: 'auto', paddingRight: 4 }}>
              {(cart.items || []).map(({ product, qty }) => (
                <div key={product.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <img src={product.images?.[0]} alt={product.title} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, background: 'var(--bg-soft)' }} />
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{product.title.slice(0, 40)}</div><div className="fine">Qty {qty} × ₹{product.price}</div></div>
                  <strong>₹{(product.price * qty).toFixed(2)}</strong>
                </div>
              ))}
              {cart.count === 0 && <p className="muted">No items. <Link to="/home">Add from shop</Link></p>}
            </div>
            <div style={{ borderTop: '1px solid var(--line)', marginTop: 12, paddingTop: 12, display: 'grid', gap: 6, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Subtotal</span><span>₹{cart.total?.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="muted">Shipping</span><span style={{ color: 'var(--success)', fontWeight: 700 }}>Free</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, borderTop: '1px solid var(--line)', paddingTop: 8 }}><span>Total</span><span>₹{cart.total?.toFixed(2)}</span></div>
            </div>
            <Link to="/cart" className="btn btn-outline btn-block" style={{ marginTop: 12 }}>Edit bag</Link>
          </div>
        </div>
      </div>
    </>
  )
}
