const express = require('express');
const { prisma, cache } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { mockProducts, mockCategories } = require('../mockData');

const router = express.Router();

// Get categories list
router.get('/categories', async (req, res) => {
  try {
    const cachedCategories = await cache.get('categories:list');
    if (cachedCategories) {
      return res.json(JSON.parse(cachedCategories));
    }

    const categories = await prisma.category.findMany();
    await cache.set('categories:list', JSON.stringify(categories), 3600); // cache for 1 hour

    res.json(categories);
  } catch (err) {
    console.warn('Prisma categories query failed, using mock fallback:', err.message);
    res.json(mockCategories);
  }
});

// List all products with filtering & basic text search
router.get('/', async (req, res) => {
  const { skinType, concern, categoryId, search } = req.query;

  try {
    const where = { status: 'active' };

    if (skinType && skinType !== 'all') {
      where.skinType = { in: [skinType, 'all'] };
    }

    if (concern && concern !== 'all') {
      where.concern = concern;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { ingredients: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (err) {
    console.warn('Prisma products list failed, returning mock data:', err.message);
    
    // Filter local mock products using the same logic
    let filtered = [...mockProducts];

    if (skinType && skinType !== 'all') {
      filtered = filtered.filter(p => p.skinType === skinType || p.skinType === 'all');
    }

    if (concern && concern !== 'all') {
      filtered = filtered.filter(p => p.concern === concern);
    }

    if (categoryId) {
      filtered = filtered.filter(p => p.categoryId === categoryId);
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(s) || 
        p.description.toLowerCase().includes(s) || 
        p.brand.toLowerCase().includes(s) || 
        p.ingredients.toLowerCase().includes(s)
      );
    }

    res.json(filtered);
  }
});

// Get a single product details with reviews & cached data
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const cacheKey = `product:detail:${id}`;
    const cachedProduct = await cache.get(cacheKey);

    if (cachedProduct) {
      return res.json(JSON.parse(cachedProduct));
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        reviews: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      // Check if it exists in mock data
      const mockP = mockProducts.find(p => p.id === id);
      if (mockP) {
        return res.json(mockP);
      }
      return res.status(404).json({ error: 'Product not found' });
    }

    await cache.set(cacheKey, JSON.stringify(product), 300); // Cache for 5 mins
    res.json(product);
  } catch (err) {
    console.warn(`Prisma product query for ${id} failed, returning mock product:`, err.message);
    const mockP = mockProducts.find(p => p.id === id);
    if (mockP) {
      return res.json(mockP);
    }
    res.status(404).json({ error: 'Product not found' });
  }
});

// Create product review
router.post('/:id/reviews', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const review = await prisma.review.create({
      data: {
        productId: id,
        userId: req.user.id,
        rating: parseInt(rating),
        comment,
      },
    });

    // Update product rating aggregate
    const reviews = await prisma.review.findMany({ where: { productId: id } });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.product.update({
      where: { id },
      data: { rating: parseFloat(avgRating.toFixed(1)) }
    });

    // Invalidate product cache
    await cache.del(`product:detail:${id}`);

    res.status(201).json(review);
  } catch (err) {
    console.warn('Prisma review submission failed, recording in mock memory:', err.message);
    
    // Fallback to local memory update
    const targetProduct = mockProducts.find(p => p.id === id);
    if (!targetProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newMockReview = {
      id: `mock-r-${Math.random()}`,
      productId: id,
      userId: req.user.id,
      rating: parseInt(rating),
      comment,
      createdAt: new Date()
    };

    if (!targetProduct.reviews) targetProduct.reviews = [];
    targetProduct.reviews.unshift(newMockReview);
    
    // Recalculate average rating
    const avg = targetProduct.reviews.reduce((sum, r) => sum + r.rating, 0) / targetProduct.reviews.length;
    targetProduct.rating = parseFloat(avg.toFixed(1));

    res.status(201).json(newMockReview);
  }
});

module.exports = router;
