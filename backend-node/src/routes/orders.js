const express = require('express');
const { prisma, cache } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get order history for customer
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Failed to retrieve order history' });
  }
});

// Get detailed order information
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findFirst({
      where: {
        id,
        // Customers can only see their own orders, admins can see all
        OR: [
          { userId: req.user.id },
          { user: { role: 'admin' } }
        ]
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    console.error('Fetch order detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve order details' });
  }
});

// Create Order (Place Order)
router.post('/', authMiddleware, async (req, res) => {
  const { items, totalPrice, shippingAddr } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required' });
  }
  if (!totalPrice || !shippingAddr) {
    return res.status(400).json({ error: 'Total price and shipping address are required' });
  }

  try {
    // 1. Transaction to create order, order items, and deduct stock
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          totalPrice: parseFloat(totalPrice),
          shippingAddr,
          status: 'pending',
          paymentStatus: 'pending',
          trackingNo: `GG-${Math.floor(100000 + Math.random() * 900000)}`, // simulated tracking number
        }
      });

      // Create order items & update stock
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price)
          }
        });

        // Deduct variant stock if variantId is provided
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId }
          });
          if (variant) {
            const newStock = Math.max(0, variant.stock - item.quantity);
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: newStock }
            });
          }
        }
      }

      return order;
    });

    // 2. Clear user's Redis cart
    await cache.del(`cart:${req.user.id}`);

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: result.id,
      order: result
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to place order. Out of stock or invalid data.' });
  }
});

module.exports = router;
