import 'dotenv/config'

function requireEnv(name, fallback) {
  const val = process.env[name] ?? fallback
  if (val === undefined || val === '') {
    throw new Error(`Missing required env var: ${name}`)
  }
  return String(val)
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV !== 'production',
  PORT: parseInt(process.env.PORT || '5000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  JWT_SECRET: (() => {
    const s = process.env.JWT_SECRET || 'dev-secret-ecom-2026-please-change'
    if (process.env.NODE_ENV === 'production' && s === 'dev-secret-ecom-2026-please-change') {
      console.warn('[env] WARNING: using default JWT_SECRET in production! Set JWT_SECRET env var.')
    }
    return s
  })(),
  JWT_EXPIRES: process.env.JWT_EXPIRES || '7d',
  CORS_ORIGIN: (() => {
    const raw = process.env.CORS_ORIGIN
    if (!raw) return true // allow all in dev
    return raw.split(',').map(s => s.trim()).filter(Boolean)
  })(),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
  DB_PROVIDER: process.env.DB_PROVIDER || 'file', // file | postgres
  DATABASE_URL: process.env.DATABASE_URL || '',
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
}

export function validateEnv() {
  if (env.isProd) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be >=32 chars in production')
    }
  }
}
