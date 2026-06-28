const express = require('express');
const stripeLib = require('stripe');
const { prisma } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

let stripe = null;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('simulated')) {
  try {
    stripe = stripeLib(process.env.STRIPE_SECRET_KEY);
    console.log('Stripe SDK initialized.');
  } catch (err) {
    console.warn('Could not initialize Stripe SDK, using simulation fallback:', err.message);
  }
}

// Create Stripe session or Simulated checkout session
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // If Stripe is configured and we're not simulating
    if (stripe) {
      const lineItems = order.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.title,
            images: [item.product.image],
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects cents
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart`,
        metadata: {
          orderId: order.id,
        }
      });

      // Update order with payment session id
      await prisma.order.update({
        where: { id: orderId },
        data: { trackingNo: session.id } // Temporary save session id
      });

      return res.json({ id: session.id, url: session.url });
    } else {
      // Payments Simulator mode (Instant Checkout)
      console.log(`Stripe not configured. Executing simulated checkout for Order: ${orderId}`);

      // We'll mark the order as paid directly
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          status: 'paid'
        }
      });

      // Respond with a mock checkout page url that auto-redirects to success page
      const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success?session_id=sim_session_${Math.random().toString(36).substring(7)}&order_id=${orderId}`;
      return res.json({ id: `sim_session_${orderId}`, url: successUrl });
    }
  } catch (err) {
    console.error('Create checkout session error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook (handles standard callback events)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  if (!stripe) {
    return res.status(400).send('Stripe webhook received but Stripe is not configured.');
  }

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret'
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          status: 'paid'
        }
      });
      console.log(`Order ${orderId} successfully marked as PAID via Stripe Webhook.`);
    } catch (dbErr) {
      console.error(`Failed to update order ${orderId} in database:`, dbErr);
    }
  }

  res.json({ received: true });
});

module.exports = router;
