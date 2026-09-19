import { v4 as uuid } from 'uuid'
import { getDb, writeDb } from '../db.js'
import { authPreHandler, requireRole } from '../utils/auth.js'

export default async function orderRoutes(fastify) {
  // Create order from cart or directly supplied items
  fastify.post('/api/orders', { preHandler: authPreHandler }, async (req, reply) => {
    const { shippingAddress, paymentMethod = 'COD', items: directItems } = req.body || {}
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      return reply.code(400).send({ error: 'shippingAddress with address, city, zip required' })
    }
    const db = getDb()
    let orderItems = []
    if (directItems && Array.isArray(directItems) && directItems.length) {
      for (const it of directItems) {
        const prod = db.products.find(p => p.id === it.productId)
        if (!prod) return reply.code(404).send({ error: `Product ${it.productId} not found` })
        if (prod.stock < it.qty) return reply.code(400).send({ error: `Insufficient stock for ${prod.title}` })
        orderItems.push({ productId: prod.id, title: prod.title, price: prod.price, qty: Number(it.qty), image: prod.images[0] })
      }
    } else {
      const cart = db.carts[req.user.id]
      if (!cart || !cart.items.length) return reply.code(400).send({ error: 'Cart is empty, supply items or add to cart first' })
      for (const it of cart.items) {
        const prod = db.products.find(p => p.id === it.productId)
        if (!prod) continue
        if (prod.stock < it.qty) return reply.code(400).send({ error: `Insufficient stock for ${prod.title}` })
        orderItems.push({ productId: prod.id, title: prod.title, price: prod.price, qty: it.qty, image: prod.images[0] })
      }
    }
    if (!orderItems.length) return reply.code(400).send({ error: 'No valid items' })
    const total = orderItems.reduce((s, i) => s + i.price * i.qty, 0)
    // decrement stock
    for (const it of orderItems) {
      const prod = db.products.find(p => p.id === it.productId)
      prod.stock -= it.qty
    }
    const order = {
      id: uuid(),
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      items: orderItems,
      total: Number(total.toFixed(2)),
      status: 'pending',
      shippingAddress,
      paymentMethod,
      deliveryManId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    db.orders.push(order)
    // clear cart
    db.carts[req.user.id] = { items: [] }
    writeDb()
    return { order }
  })

  // List orders - user sees own, admin/vendor/delivery see all or filtered
  fastify.get('/api/orders', { preHandler: authPreHandler }, async (req) => {
    const db = getDb()
    const { role, id } = req.user
    let orders = [...db.orders]
    if (role === 'user') orders = orders.filter(o => o.userId === id)
    else if (role === 'delivery') orders = orders.filter(o => !o.deliveryManId || o.deliveryManId === id)
    // admin & vendor see all
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return { orders }
  })

  fastify.get('/api/orders/:id', { preHandler: authPreHandler }, async (req, reply) => {
    const db = getDb()
    const order = db.orders.find(o => o.id === req.params.id)
    if (!order) return reply.code(404).send({ error: 'Order not found' })
    if (req.user.role === 'user' && order.userId !== req.user.id) return reply.code(403).send({ error: 'Forbidden' })
    return { order }
  })

  // Update status
  fastify.patch('/api/orders/:id/status', { preHandler: authPreHandler }, async (req, reply) => {
    const { status, deliveryManId } = req.body || {}
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!allowed.includes(status)) return reply.code(400).send({ error: 'Invalid status' })
    const db = getDb()
    const order = db.orders.find(o => o.id === req.params.id)
    if (!order) return reply.code(404).send({ error: 'Order not found' })
    // role checks
    const { role, id } = req.user
    if (role === 'user' && status !== 'cancelled') return reply.code(403).send({ error: 'Users can only cancel' })
    if (role === 'user' && order.userId !== id) return reply.code(403).send({ error: 'Forbidden' })
    if (role === 'user' && order.status !== 'pending') return reply.code(400).send({ error: 'Can only cancel pending orders' })

    order.status = status
    order.updatedAt = new Date().toISOString()
    if (deliveryManId) order.deliveryManId = deliveryManId
    if (role === 'delivery' && !order.deliveryManId) order.deliveryManId = id
    writeDb()
    return { order }
  })

  // Assign delivery
  fastify.post('/api/orders/:id/assign', { preHandler: [authPreHandler, requireRole('admin')] }, async (req, reply) => {
    const db = getDb()
    const order = db.orders.find(o => o.id === req.params.id)
    if (!order) return reply.code(404).send({ error: 'Order not found' })
    const { deliveryManId } = req.body || {}
    if (!deliveryManId) return reply.code(400).send({ error: 'deliveryManId required' })
    const dm = db.users.find(u => u.id === deliveryManId && u.role === 'delivery')
    if (!dm) return reply.code(404).send({ error: 'Delivery man not found' })
    order.deliveryManId = deliveryManId
    order.status = 'processing'
    order.updatedAt = new Date().toISOString()
    writeDb()
    return { order }
  })

  fastify.get('/api/users', { preHandler: [authPreHandler, requireRole('admin')] }, async () => {
    const db = getDb()
    const users = db.users.map(({ passwordHash, ...u }) => u)
    return { users }
  })
}
