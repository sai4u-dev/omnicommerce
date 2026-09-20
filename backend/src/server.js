import Fastify from 'fastify'
import { env, validateEnv } from './config/env.js'
import { registerSecurity } from './plugins/security.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import cartRoutes from './routes/cart.js'
import wishlistRoutes from './routes/wishlist.js'
import orderRoutes from './routes/orders.js'
import { getDb } from './db.js'

validateEnv()

const app = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    transport: env.isDev ? { target: 'pino-pretty', options: { translateTime: 'SYS:standard', ignore: 'pid,hostname' } } : undefined,
  },
  trustProxy: true,
  requestIdHeader: 'x-request-id',
  genReqId: (req) => req.headers['x-request-id'] || Math.random().toString(36).slice(2, 9),
})

// ── Security: helmet, cors, rate-limit, sensible ──
await registerSecurity(app)

// ── Swagger (only non-prod or when enabled) ──
if (env.isDev) {
  try {
    const swagger = await import('@fastify/swagger')
    const swaggerUi = await import('@fastify/swagger-ui')
    await app.register(swagger.default, {
      openapi: {
        info: { title: 'OmniCommerce API', description: 'Single backend for Web + Mobile (Expo) + Desktop (Electron)', version: '1.0.0' },
        servers: [{ url: `http://localhost:${env.PORT}` }],
        components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
      },
    })
    await app.register(swaggerUi.default, { routePrefix: '/docs', uiConfig: { docExpansion: 'list' } })
    app.log.info('Swagger docs at /docs')
  } catch (e) {
    app.log.warn('Swagger not available: ' + e.message)
  }
}

// ── Health checks ──
app.get('/api/health', async () => ({ status: 'ok', time: new Date().toISOString(), uptime: process.uptime(), env: env.NODE_ENV }))
app.get('/api/ready', async (req, reply) => {
  try {
    const db = getDb()
    // light check — db accessible
    if (!db) throw new Error('db unavailable')
    return { status: 'ready', time: new Date().toISOString(), checks: { db: 'ok', products: db.products.length, users: db.users.length } }
  } catch (e) {
    return reply.code(503).send({ status: 'not ready', error: e.message })
  }
})
app.get('/api/live', async () => ({ status: 'alive', time: new Date().toISOString() }))

app.get('/api/stats', async () => {
  const db = getDb()
  return { products: db.products.length, users: db.users.length, orders: db.orders.length, categories: db.categories.length }
})

// ── API Routes (single backend, multiple consumers: web, mobile, desktop) ──
await app.register(authRoutes)
await app.register(productRoutes)
await app.register(categoryRoutes)
await app.register(cartRoutes)
await app.register(wishlistRoutes)
await app.register(orderRoutes)

// ── Domain hint middleware: expose app type from header for analytics ──
app.addHook('onRequest', async (req) => {
  // clients should send x-app-type: web | mobile | desktop and x-app-role: user|admin|vendor|delivery
  req.appType = req.headers['x-app-type'] || 'web'
  req.appRole = req.headers['x-app-role'] || req.headers['x-client-role'] || 'unknown'
})

// ── 404 & error handling ──
app.setNotFoundHandler((req, reply) => reply.code(404).send({ error: 'Not found', path: req.url, method: req.method }))

app.setErrorHandler((error, req, reply) => {
  const status = error.statusCode || error.status || 500
  const isValidation = !!error.validation
  req.log.error({ err: error, status, url: req.url }, error.message)
  if (isValidation) {
    return reply.code(400).send({ error: 'Validation error', message: error.message, details: error.validation })
  }
  if (status === 429) {
    return reply.code(429).send({ error: 'Too many requests', message: error.message })
  }
  const message = env.isProd && status === 500 ? 'Internal server error' : error.message
  return reply.code(status).send({ error: message, statusCode: status, requestId: req.id })
})

// ── Graceful shutdown ──
const signals = ['SIGINT', 'SIGTERM']
for (const sig of signals) {
  process.on(sig, async () => {
    app.log.info(`Received ${sig}, closing...`)
    try {
      await app.close()
      process.exit(0)
    } catch (e) {
      app.log.error(e)
      process.exit(1)
    }
  })
}

process.on('unhandledRejection', (err) => app.log.error({ err }, 'unhandledRejection'))
process.on('uncaughtException', (err) => {
  app.log.fatal({ err }, 'uncaughtException')
  process.exit(1)
})

const PORT = env.PORT
const HOST = env.HOST

try {
  await app.listen({ port: PORT, host: HOST })
  console.log(`🚀 OmniCommerce API running at http://${HOST}:${PORT} [${env.NODE_ENV}]`)
  console.log(`   Health: http://localhost:${PORT}/api/health`)
  if (env.isDev) console.log(`   Docs:   http://localhost:${PORT}/docs`)
  console.log(`   Consumers: Web (Vite :5173-5176) | Mobile (Expo) | Desktop (Electron)`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

export default app
