import { getDb, writeDb } from '../db.js'
import { authPreHandler } from '../utils/auth.js'

export default async function wishlistRoutes(fastify) {
  fastify.get('/api/wishlist', { preHandler: authPreHandler }, async (req) => {
    const db = getDb()
    const ids = db.wishlists[req.user.id] || []
    const products = ids.map(id => db.products.find(p => p.id === id)).filter(Boolean)
    return { wishlist: products }
  })

  fastify.post('/api/wishlist/:productId', { preHandler: authPreHandler }, async (req, reply) => {
    const db = getDb()
    const prod = db.products.find(p => p.id === req.params.productId)
    if (!prod) return reply.code(404).send({ error: 'Product not found' })
    const list = db.wishlists[req.user.id] || []
    const idx = list.indexOf(req.params.productId)
    let action
    if (idx === -1) { list.push(req.params.productId); action = 'added' }
    else { list.splice(idx, 1); action = 'removed' }
    db.wishlists[req.user.id] = list
    writeDb()
    return { action, wishlist: list }
  })

  fastify.delete('/api/wishlist/:productId', { preHandler: authPreHandler }, async (req) => {
    const db = getDb()
    const list = db.wishlists[req.user.id] || []
    db.wishlists[req.user.id] = list.filter(id => id !== req.params.productId)
    writeDb()
    return { wishlist: db.wishlists[req.user.id] }
  })
}
