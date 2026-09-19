import { v4 as uuid } from 'uuid'
import { getDb, writeDb } from '../db.js'
import { authPreHandler, requireRole } from '../utils/auth.js'

export default async function productRoutes(fastify) {
  // List with filters
  fastify.get('/api/products', async (req, reply) => {
    const db = getDb()
    let { search, category, minPrice, maxPrice, sort, page = '1', limit = '12', featured } = req.query
    let items = [...db.products]

    if (search) {
      const s = search.toLowerCase()
      items = items.filter(p => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s))
    }
    if (category && category !== 'all') {
      items = items.filter(p => p.category === category)
    }
    if (minPrice) items = items.filter(p => p.price >= Number(minPrice))
    if (maxPrice) items = items.filter(p => p.price <= Number(maxPrice))
    if (featured === 'true') items = items.filter(p => p.isFeatured)

    if (sort === 'price_asc') items.sort((a, b) => a.price - b.price)
    else if (sort === 'price_desc') items.sort((a, b) => b.price - a.price)
    else if (sort === 'rating') items.sort((a, b) => b.rating - a.rating)
    else if (sort === 'newest') items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const total = items.length
    const pg = Math.max(1, parseInt(page))
    const lim = Math.min(50, Math.max(1, parseInt(limit)))
    const start = (pg - 1) * lim
    const paged = items.slice(start, start + lim)

    return { products: paged, total, page: pg, limit: lim, totalPages: Math.ceil(total / lim) }
  })

  // Single
  fastify.get('/api/products/:id', async (req, reply) => {
    const db = getDb()
    const p = db.products.find(x => x.id === req.params.id)
    if (!p) return reply.code(404).send({ error: 'Product not found' })
    return { product: p }
  })

  // Create
  fastify.post('/api/products', { preHandler: [authPreHandler, requireRole('admin', 'vendor')] }, async (req, reply) => {
    const { title, description, price, originalPrice, category, brand, images, stock, isFeatured } = req.body || {}
    if (!title || price == null || !category) return reply.code(400).send({ error: 'title, price, category required' })
    const db = getDb()
    const prod = {
      id: uuid(),
      title, description: description || '', price: Number(price), originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      category, brand: brand || 'Generic',
      images: Array.isArray(images) && images.length ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
      rating: 0, reviewsCount: 0, stock: stock ? Number(stock) : 10,
      isFeatured: !!isFeatured, vendorId: req.user.role === 'vendor' ? req.user.id : null,
      createdAt: new Date().toISOString()
    }
    db.products.push(prod)
    writeDb()
    return { product: prod }
  })

  // Update
  fastify.put('/api/products/:id', { preHandler: [authPreHandler, requireRole('admin', 'vendor')] }, async (req, reply) => {
    const db = getDb()
    const prod = db.products.find(x => x.id === req.params.id)
    if (!prod) return reply.code(404).send({ error: 'Product not found' })
    if (req.user.role === 'vendor' && prod.vendorId && prod.vendorId !== req.user.id) return reply.code(403).send({ error: 'Not owner' })
    Object.assign(prod, req.body)
    if (req.body.price) prod.price = Number(req.body.price)
    if (req.body.originalPrice) prod.originalPrice = Number(req.body.originalPrice)
    if (req.body.stock) prod.stock = Number(req.body.stock)
    writeDb()
    return { product: prod }
  })

  // Delete
  fastify.delete('/api/products/:id', { preHandler: [authPreHandler, requireRole('admin', 'vendor')] }, async (req, reply) => {
    const db = getDb()
    const idx = db.products.findIndex(x => x.id === req.params.id)
    if (idx === -1) return reply.code(404).send({ error: 'Product not found' })
    const prod = db.products[idx]
    if (req.user.role === 'vendor' && prod.vendorId && prod.vendorId !== req.user.id) return reply.code(403).send({ error: 'Not owner' })
    db.products.splice(idx, 1)
    writeDb()
    return { success: true }
  })

  // Reviews for product
  fastify.get('/api/products/:id/reviews', async (req, reply) => {
    const db = getDb()
    const reviews = db.reviews.filter(r => r.productId === req.params.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return { reviews }
  })

  fastify.post('/api/products/:id/reviews', { preHandler: authPreHandler }, async (req, reply) => {
    const db = getDb()
    const product = db.products.find(p => p.id === req.params.id)
    if (!product) return reply.code(404).send({ error: 'Product not found' })
    const { rating, comment } = req.body || {}
    if (!rating || rating < 1 || rating > 5) return reply.code(400).send({ error: 'rating 1-5 required' })
    const review = {
      id: uuid(),
      productId: req.params.id,
      userId: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date().toISOString()
    }
    db.reviews.push(review)
    // recalc rating
    const all = db.reviews.filter(r => r.productId === product.id)
    product.rating = Number((all.reduce((s, r) => s + r.rating, 0) / all.length).toFixed(1))
    product.reviewsCount = all.length
    writeDb()
    return { review }
  })
}
