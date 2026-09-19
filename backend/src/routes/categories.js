import { v4 as uuid } from 'uuid'
import { getDb, writeDb } from '../db.js'
import { authPreHandler, requireRole } from '../utils/auth.js'

export default async function categoryRoutes(fastify) {
  fastify.get('/api/categories', async () => {
    const db = getDb()
    return { categories: db.categories }
  })

  fastify.post('/api/categories', { preHandler: [authPreHandler, requireRole('admin')] }, async (req, reply) => {
    const { name, image } = req.body || {}
    if (!name) return reply.code(400).send({ error: 'name required' })
    const slug = name.toLowerCase().replace(/\s+/g, '-')
    const db = getDb()
    if (db.categories.find(c => c.slug === slug)) return reply.code(409).send({ error: 'Category exists' })
    const cat = { id: uuid(), name, slug, image: image || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400' }
    db.categories.push(cat)
    writeDb()
    return { category: cat }
  })
}
