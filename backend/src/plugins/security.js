import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import sensible from '@fastify/sensible'
import cors from '@fastify/cors'
import { env } from '../config/env.js'

export async function registerSecurity(app) {
  await app.register(sensible)

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-app-type', 'x-app-role', 'x-request-id', 'x-client-role'],
    exposedHeaders: ['x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset', 'x-request-id'],
  })

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    allowList: (req) => req.url === '/api/health' || req.url === '/api/ready',
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
    errorResponseBuilder: (req, context) => ({
      error: 'Too many requests',
      message: `Rate limit exceeded, retry in ${Math.round(context.after / 1000)}s`,
      retryAfter: context.after,
    }),
  })
}
