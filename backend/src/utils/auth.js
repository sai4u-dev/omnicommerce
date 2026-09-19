import { verifyToken } from './jwt.js'

export async function authPreHandler(req, reply) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Missing or invalid Authorization header' })
  }
  const token = header.slice(7)
  try {
    const decoded = verifyToken(token)
    req.user = decoded
  } catch (e) {
    return reply.code(401).send({ error: 'Invalid or expired token' })
  }
}

export function requireRole(...roles) {
  return async (req, reply) => {
    if (!req.user) return reply.code(401).send({ error: 'Unauthorized' })
    if (!roles.includes(req.user.role)) {
      return reply.code(403).send({ error: 'Forbidden: insufficient role' })
    }
  }
}
