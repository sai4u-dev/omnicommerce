import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { getDb, writeDb } from '../db.js'
import { signToken } from '../utils/jwt.js'
import { authPreHandler } from '../utils/auth.js'

// In-memory OTP store: key = normalized identifier -> { otp, expiresAt, attempts, lastSentAt }
const otpStore = new Map()
const OTP_TTL_MS = 5 * 60 * 1000 // 5 minutes
const OTP_RESEND_MS = 30 * 1000 // 30 sec

function normalizeIdentifier(id) {
  const t = String(id).trim()
  if (t.includes('@')) return t.toLowerCase()
  // phone: keep digits only, allow + prefix handling
  return t.replace(/\D/g, '')
}
function isEmail(id) { return String(id).includes('@') }
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }
function isValidPhone(phone) {
  const digits = String(phone).replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}
function genOtp() { return Math.floor(100000 + Math.random() * 900000).toString() }

export default async function authRoutes(fastify) {
  // Register — now supports phone as well
  fastify.post('/api/auth/register', async (req, reply) => {
    const { name, email, password, role, phone } = req.body || {}
    if (!name || !email || !password) return reply.code(400).send({ error: 'name, email, password required' })
    if (!isValidEmail(email)) return reply.code(400).send({ error: 'Invalid email format' })
    if (password.length < 6) return reply.code(400).send({ error: 'Password must be >=6 chars' })
    if (phone && !isValidPhone(phone)) return reply.code(400).send({ error: 'Invalid phone number' })
    const db = getDb()
    const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (exists) return reply.code(409).send({ error: 'Email already registered' })
    if (phone) {
      const normPhone = phone.replace(/\D/g, '')
      const phoneExists = db.users.find(u => u.phone === normPhone)
      if (phoneExists) return reply.code(409).send({ error: 'Phone already registered' })
    }
    const allowedRoles = ['user', 'vendor', 'delivery']
    const finalRole = allowedRoles.includes(role) ? role : 'user'
    const user = {
      id: uuid(),
      name,
      email: email.toLowerCase(),
      phone: phone ? phone.replace(/\D/g, '') : null,
      passwordHash: bcrypt.hashSync(password, 10),
      role: finalRole,
      createdAt: new Date().toISOString(),
      addresses: []
    }
    db.users.push(user)
    writeDb()
    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })
    const { passwordHash, ...safe } = user
    return { token, user: safe }
  })

  // Login with email+password
  fastify.post('/api/auth/login', async (req, reply) => {
    const { email, password } = req.body || {}
    if (!email || !password) return reply.code(400).send({ error: 'email and password required' })
    const db = getDb()
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return reply.code(401).send({ error: 'Invalid credentials' })
    const ok = bcrypt.compareSync(password, user.passwordHash)
    if (!ok) return reply.code(401).send({ error: 'Invalid credentials' })
    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })
    const { passwordHash, ...safe } = user
    return { token, user: safe }
  })

  // ---- OTP: request ----
  fastify.post('/api/auth/otp/request', async (req, reply) => {
    const { identifier } = req.body || {}
    if (!identifier) return reply.code(400).send({ error: 'identifier (email or phone) required' })
    const raw = String(identifier).trim()
    const isEm = isEmail(raw)
    if (isEm) {
      if (!isValidEmail(raw)) return reply.code(400).send({ error: 'Invalid email format' })
    } else {
      if (!isValidPhone(raw)) return reply.code(400).send({ error: 'Invalid phone number (10-15 digits required)' })
    }
    const key = normalizeIdentifier(raw)
    const existing = otpStore.get(key)
    if (existing && Date.now() - existing.lastSentAt < OTP_RESEND_MS) {
      const wait = Math.ceil((OTP_RESEND_MS - (Date.now() - existing.lastSentAt)) / 1000)
      return reply.code(429).send({ error: `Please wait ${wait}s before requesting again` })
    }
    const otp = genOtp()
    const expiresAt = Date.now() + OTP_TTL_MS
    otpStore.set(key, { otp, expiresAt, attempts: 0, lastSentAt: Date.now() })
    // auto-expire after TTL + buffer
    setTimeout(() => {
      const cur = otpStore.get(key)
      if (cur && cur.expiresAt === expiresAt) otpStore.delete(key)
    }, OTP_TTL_MS + 1000)

    // In production you'd send via SMS / Email provider. Here we return OTP for dev & log it.
    console.log(`[OTP] ${key} => ${otp} (expires in 5m)`)
    return {
      message: `OTP sent to ${isEm ? 'email' : 'phone'} (dev: OTP is ${otp})`,
      identifier: key,
      otp, // <-- remove in production; kept for demo
      expiresIn: 300,
      channel: isEm ? 'email' : 'phone'
    }
  })

  // ---- OTP: verify & login/signup ----
  fastify.post('/api/auth/otp/verify', async (req, reply) => {
    const { identifier, otp, name } = req.body || {}
    if (!identifier || !otp) return reply.code(400).send({ error: 'identifier and otp required' })
    const key = normalizeIdentifier(identifier)
    const record = otpStore.get(key)
    if (!record) return reply.code(400).send({ error: 'No OTP requested or OTP expired. Please request again.' })
    if (Date.now() > record.expiresAt) {
      otpStore.delete(key)
      return reply.code(400).send({ error: 'OTP expired. Please request a new one.' })
    }
    if (record.attempts >= 3) {
      otpStore.delete(key)
      return reply.code(429).send({ error: 'Too many failed attempts. Please request a new OTP.' })
    }
    if (String(otp) !== String(record.otp)) {
      record.attempts += 1
      otpStore.set(key, record)
      const left = 3 - record.attempts
      return reply.code(401).send({ error: `Invalid OTP. ${left > 0 ? left + ' attempts left' : 'No attempts left, request new OTP'}` })
    }
    // success -> consume OTP
    otpStore.delete(key)
    const db = getDb()
    const isEm = isEmail(identifier)
    let user = null
    if (isEm) {
      user = db.users.find(u => u.email.toLowerCase() === key)
    } else {
      user = db.users.find(u => u.phone === key)
    }

    // auto-create if not exists (passwordless user)
    if (!user) {
      const now = new Date().toISOString()
      const displayName = name?.trim() || (isEm ? key.split('@')[0] : `User ${key.slice(-4)}`)
      if (isEm) {
        user = {
          id: uuid(),
          name: displayName,
          email: key,
          phone: null,
          passwordHash: bcrypt.hashSync(uuid(), 10),
          role: 'user',
          createdAt: now,
          addresses: []
        }
      } else {
        // phone user: create placeholder email to keep email unique constraint, but use phone as primary
        const placeholderEmail = `${key}@phone.local`
        // ensure placeholder not collides
        const emailExists = db.users.find(u => u.email === placeholderEmail)
        user = {
          id: uuid(),
          name: displayName,
          email: emailExists ? `${key}-${Date.now()}@phone.local` : placeholderEmail,
          phone: key,
          passwordHash: bcrypt.hashSync(uuid(), 10),
          role: 'user',
          createdAt: now,
          addresses: []
        }
      }
      db.users.push(user)
      writeDb()
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })
    const { passwordHash, ...safe } = user
    return { token, user: safe, message: 'OTP verified successfully' }
  })

  // Me
  fastify.get('/api/auth/me', { preHandler: authPreHandler }, async (req, reply) => {
    const db = getDb()
    const user = db.users.find(u => u.id === req.user.id)
    if (!user) return reply.code(404).send({ error: 'User not found' })
    const { passwordHash, ...safe } = user
    return { user: safe }
  })

  // Update profile
  fastify.put('/api/auth/me', { preHandler: authPreHandler }, async (req, reply) => {
    const db = getDb()
    const user = db.users.find(u => u.id === req.user.id)
    if (!user) return reply.code(404).send({ error: 'User not found' })
    const { name, addresses, phone } = req.body || {}
    if (name) user.name = name
    if (phone !== undefined) {
      if (phone && !isValidPhone(phone)) return reply.code(400).send({ error: 'Invalid phone' })
      user.phone = phone ? phone.replace(/\D/g, '') : null
    }
    if (Array.isArray(addresses)) user.addresses = addresses
    writeDb()
    const { passwordHash, ...safe } = user
    return { user: safe }
  })
}
