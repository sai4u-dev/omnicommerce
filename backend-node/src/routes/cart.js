const express = require('express');
const { cache } = require('../db');

const router = express.Router();

// Helper to get active cart ID (JWT user ID or session ID header)
const getCartId = (req) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretglowguidekey2026');
      return `cart:${decoded.id}`;
    } catch (e) {
      // Decryption failed or token expired, fallback to session ID
    }
  }

  const sessionId = req.headers['x-session-id'] || 'anonymous-default-session';
  return `cart:session:${sessionId}`;
};

// Get Cart Items
router.get('/', async (req, res) => {
  const cartKey = getCartId(req);
  try {
    const rawCart = await cache.get(cartKey);
    res.json(rawCart ? JSON.parse(rawCart) : []);
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Failed to retrieve cart items' });
  }
});

// Update Cart Items
router.post('/', async (req, res) => {
  const cartKey = getCartId(req);
  const { items } = req.body; // Array of { productId, quantity, variantId, title, price, image }

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array' });
  }

  try {
    await cache.set(cartKey, JSON.stringify(items), 86400 * 7); // Cache for 7 days
    res.json({ message: 'Cart updated successfully', items });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Clear Cart Items
router.delete('/', async (req, res) => {
  const cartKey = getCartId(req);
  try {
    await cache.del(cartKey);
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
