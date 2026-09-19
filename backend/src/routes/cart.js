import { getDb, writeDb } from '../db.js'
import { authPreHandler } from '../utils/auth.js'

export default async function cartRoutes(fastify) {
  fastify.get('/api/cart', { preHandler: authPreHandler }, async (req) => {
    const db = getDb()
    const cart = db.carts[req.user.id] || { items: [] }
    // enrich with product data
    const enriched = cart.items.map(it => {
      const prod = db.products.find(p => p.id === it.productId)
      return { ...it, product: prod || null }
    }).filter(x => x.product)
    const total = enriched.reduce((s, i) => s + i.product.price * i.qty, 0)
    return { items: enriched, total, count: enriched.reduce((s,i)=>s+i.qty,0) }
  })

  fastify.post('/api/cart', { preHandler: authPreHandler }, async (req, reply) => {
    const { productId, qty = 1 } = req.body || {}
    if (!productId) return reply.code(400).send({ error: 'productId required' })
    const db = getDb()
    const prod = db.products.find(p => p.id === productId)
    if (!prod) return reply.code(404).send({ error: 'Product not found' })
    if (prod.stock < qty) return reply.code(400).send({ error: 'Insufficient stock' })
    const cart = db.carts[req.user.id] || { items: [] }
    const existing = cart.items.find(i => i.productId === productId)
    if (existing) existing.qty += Number(qty)
    else cart.items.push({ productId, qty: Number(qty) })
    db.carts[req.user.id] = cart
    writeDb()
    return { cart }
  })

  fastify.put('/api/cart/:productId', { preHandler: authPreHandler }, async (req, reply) => {
    const { qty } = req.body || {}
    if (qty == null || qty < 1) return reply.code(400).send({ error: 'qty >=1 required' })
    const db = getDb()
    const cart = db.carts[req.user.id]
    if (!cart) return reply.code(404).send({ error: 'Cart empty' })
    const it = cart.items.find(i => i.productId === req.params.productId)
    if (!it) return reply.code(404).send({ error: 'Item not in cart' })
    const prod = db.products.find(p => p.id === it.productId)
    if (prod && qty > prod.stock) return reply.code(400).send({ error: 'Insufficient stock' })
    it.qty = Number(qty)
    writeDb()
    return { cart }
  })

  fastify.delete('/api/cart/:productId', { preHandler: authPreHandler }, async (req) => {
    const db = getDb()
    const cart = db.carts[req.user.id] || { items: [] }
    cart.items = cart.items.filter(i => i.productId !== req.params.productId)
    db.carts[req.user.id] = cart
    writeDb()
    return { cart }
  })

  fastify.delete('/api/cart', { preHandler: authPreHandler }, async (req) => {
    const db = getDb()
    db.carts[req.user.id] = { items: [] }
    writeDb()
    return { success: true }
  })
}
