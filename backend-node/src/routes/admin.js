const express = require('express');
const { prisma, mongo } = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply admin protection to all routes in this router
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all orders in the system
router.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
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
    console.error('Admin fetch orders error:', err);
    res.status(500).json({ error: 'Failed to retrieve all orders' });
  }
});

// Update order status/tracking
router.patch('/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus, trackingNo } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status || order.status,
        paymentStatus: paymentStatus || order.paymentStatus,
        trackingNo: trackingNo || order.trackingNo,
      }
    });

    res.json(updatedOrder);
  } catch (err) {
    console.error('Admin update order error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Create product manually
router.post('/products', async (req, res) => {
  const { title, description, price, brand, image, skinType, concern, ingredients, categoryId, stock } = req.body;

  if (!title || !description || !price || !brand || !skinType || !concern || !ingredients || !categoryId) {
    return res.status(400).json({ error: 'Required product details are missing' });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    // Check if slug is unique
    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) {
      return res.status(400).json({ error: 'Product title must generate a unique slug. This title exists.' });
    }

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description,
        price: parseFloat(price),
        brand,
        image: image || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400&auto=format&fit=crop',
        skinType,
        concern,
        ingredients,
        categoryId,
        variants: {
          create: [
            { name: 'Standard Size', price: parseFloat(price), stock: parseInt(stock || 50) }
          ]
        }
      },
      include: {
        variants: true
      }
    });

    // Write a log to MongoDB for version tracking
    await mongo.insertOne('product_history', {
      productId: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      updatedBy: req.user.email,
      action: 'created'
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Admin create product error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Get admin analytics
router.get('/analytics', async (req, res) => {
  try {
    // 1. Total revenue & orders count
    const paidOrders = await prisma.order.findMany({
      where: { paymentStatus: 'paid' }
    });
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    const totalOrdersCount = await prisma.order.count();
    const totalCustomersCount = await prisma.user.count({ where: { role: 'customer' } });

    // 2. Skincare concerns distribution (aggregate based on product sales or interests)
    // For demo purposes, we do a real count from products and mock a distribution of chats
    const products = await prisma.product.findMany({ select: { concern: true } });
    const productConcernCounts = {};
    products.forEach(p => {
      productConcernCounts[p.concern] = (productConcernCounts[p.concern] || 0) + 1;
    });

    // 3. Retrieve chat metrics from MongoDB
    const chatSessions = await mongo.findMany('chat_sessions', {}, 100);
    const totalConversations = chatSessions.length;

    // 4. Monthly/daily sales distribution
    const salesOverTime = paidOrders.map(o => ({
      date: o.createdAt.toISOString().slice(0, 10),
      amount: o.totalPrice
    })).reduce((acc, current) => {
      const existing = acc.find(item => item.date === current.date);
      if (existing) {
        existing.amount += current.amount;
      } else {
        acc.push({ date: current.date, amount: current.amount });
      }
      return acc;
    }, []);

    res.json({
      revenue: parseFloat(totalRevenue.toFixed(2)),
      ordersCount: totalOrdersCount,
      customersCount: totalCustomersCount,
      totalConversations,
      concernCounts: {
        hydration: productConcernCounts.hydration || 0,
        acne: productConcernCounts.acne || 0,
        aging: productConcernCounts.aging || 0,
        brightening: productConcernCounts.brightening || 0,
      },
      salesOverTime: salesOverTime.slice(-7) // last 7 days with sales
    });
  } catch (err) {
    console.error('Admin fetch analytics error:', err);
    res.status(500).json({ error: 'Failed to compile dashboard metrics' });
  }
});

module.exports = router;
