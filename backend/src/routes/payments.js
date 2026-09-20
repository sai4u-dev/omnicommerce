import { authPreHandler } from '../utils/auth.js'
import { v4 as uuid } from 'uuid'

export default async function paymentRoutes(fastify) {
  // Mock Stripe PaymentIntent creation — in prod replace with stripe.paymentIntents.create
  fastify.post('/api/payments/stripe/intent', { preHandler: authPreHandler }, async (req, reply) => {
    const { amount, currency = 'inr' } = req.body || {}
    if (!amount || amount <= 0) return reply.code(400).send({ error: 'amount required' })
    // simulate Stripe clientSecret
    const clientSecret = `pi_mock_${uuid().replace(/-/g, '')}_secret_${Math.random().toString(36).slice(2, 10)}`
    return {
      id: `pi_mock_${uuid().slice(0, 8)}`,
      clientSecret,
      amount,
      currency,
      status: 'requires_payment_method',
      mock: true,
      message: 'Mock Stripe intent — use card 4242 4242 4242 4242 for success, 4000 0000 0000 0002 for decline (frontend handles mock)'
    }
  })

  // Mock confirm — always succeeds unless card ends with 0000
  fastify.post('/api/payments/stripe/confirm', { preHandler: authPreHandler }, async (req, reply) => {
    const { paymentIntentId, cardLast4 } = req.body || {}
    if (!paymentIntentId) return reply.code(400).send({ error: 'paymentIntentId required' })
    if (String(cardLast4).endsWith('0000')) {
      return reply.code(402).send({ error: 'Card declined (mock)', decline_code: 'card_declined' })
    }
    return { id: paymentIntentId, status: 'succeeded', mock: true }
  })

  // COD is just an order with paymentMethod=COD — no extra endpoint, but expose for consistency
  fastify.post('/api/payments/cod', { preHandler: authPreHandler }, async () => {
    return { status: 'pending', method: 'COD', message: 'Pay on delivery — order will be created via POST /api/orders with paymentMethod=COD' }
  })
}
