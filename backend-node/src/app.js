require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { prisma } = require('./db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for frontend application
app.use(cors({
  origin: '*', // For development, allow all. In production restrict to process.env.FRONTEND_URL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));

// Apply JSON parser (Stripe webhook needs raw body, we skip it here since it's handled in its route)
app.use((req, res, next) => {
  if (req.originalUrl === '/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Register routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/payments', paymentRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Express Unhandled Error:', err);
  res.status(500).json({ error: 'Internal server error occurred.' });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`Node Commerce API running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing server...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Postgres connection closed.');
    process.exit(0);
  });
});
