import Fastify from 'fastify'
import cors from '@fastify/cors'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import cartRoutes from './routes/cart.js'
import wishlistRoutes from './routes/wishlist.js'
import orderRoutes from './routes/orders.js'
import { getDb } from './db.js'

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: true,
  credentials: true
})

app.get('/api/health', async () => ({ status: 'ok', time: new Date().toISOString() }))

app.get('/api/stats', async () => {
  const db = getDb()
  return {
    products: db.products.length,
    users: db.users.length,
    orders: db.orders.length,
    categories: db.categories.length
  }
})

await app.register(authRoutes)
await app.register(productRoutes)
await app.register(categoryRoutes)
await app.register(cartRoutes)
await app.register(wishlistRoutes)
await app.register(orderRoutes)

// fallback
app.setNotFoundHandler((req, reply) => reply.code(404).send({ error: 'Not found' }))

const PORT = process.env.PORT || 5000
const HOST = '0.0.0.0'

app.listen({ port: PORT, host: HOST }).then(() => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`)
}).catch(err => {
  app.log.error(err)
  process.exit(1)
})
