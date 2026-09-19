import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-ecom-2026-please-change'
const JWT_EXPIRES = '7d'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}
