const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create vector extension and add column if they do not exist
  try {
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('Vector extension ensured.');
  } catch (err) {
    console.error('Error creating vector extension (might need superuser privileges):', err.message);
  }

  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);');
    console.log('Embedding vector column ensured.');
  } catch (err) {
    console.error('Error adding embedding column:', err.message);
  }

  // Clear existing data
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@glowguide.com',
      password: adminPassword,
      name: 'Admin GlowGuide',
      role: 'admin',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@glowguide.com',
      password: userPassword,
      name: 'Sai Narendra',
      role: 'customer',
    },
  });

  console.log('Users seeded.');

  // Seed Categories
  const cleanserCat = await prisma.category.create({
    data: { name: 'Cleansers', slug: 'cleansers', description: 'Gentle and effective cleansers for all skin types' }
  });
  const tonerCat = await prisma.category.create({
    data: { name: 'Toners', slug: 'toners', description: 'Hydrating and clarifying skin toners' }
  });
  const serumCat = await prisma.category.create({
    data: { name: 'Serums & Treatments', slug: 'serums-treatments', description: 'Active treatments targeted for specific concerns' }
  });
  const moisturizerCat = await prisma.category.create({
    data: { name: 'Moisturizers', slug: 'moisturizers', description: 'Nourishing creams and lotions to lock in hydration' }
  });
  const sunscreenCat = await prisma.category.create({
    data: { name: 'Sunscreens', slug: 'sunscreens', description: 'Broad-spectrum physical and chemical UV filters' }
  });

  console.log('Categories seeded.');

  // Seed Products
  const productsData = [
    {
      title: 'Centella Gentle Foam Cleanser',
      slug: 'centella-gentle-foam-cleanser',
      description: 'A mild pH-balanced foaming cleanser infused with Centella Asiatica extract. It sweeps away impurities while leaving the skin barrier intact, hydrated, and calm. Ideal for daily use morning and night.',
      price: 18.00,
      brand: 'GlowGuide Care',
      image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400&auto=format&fit=crop',
      skinType: 'sensitive',
      concern: 'hydration',
      ingredients: 'Centella Asiatica Extract, Glycerin, Sodium Cocoyl Isethionate, Coco-Betaine, Panthenol, Allantoin',
      categoryId: cleanserCat.id,
      rating: 4.8,
      variants: {
        create: [
          { name: '150ml', price: 18.00, stock: 120 },
          { name: '250ml Value Size', price: 28.00, stock: 45 }
        ]
      }
    },
    {
      title: 'BHA Pore Refining Toner',
      slug: 'bha-pore-refining-toner',
      description: 'Formulated with 2% Salicylic Acid (BHA), this toner gently exfoliates dead skin cells, targets blackheads, and controls excess oil secretion. Tea tree oil helps calm redness and breakouts.',
      price: 22.00,
      brand: 'GlowGuide Active',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop',
      skinType: 'oily',
      concern: 'acne',
      ingredients: 'Salicylic Acid 2%, Water, Methylpropanediol, Tea Tree Leaf Oil, Green Tea Extract, Sodium Hyaluronate',
      categoryId: tonerCat.id,
      rating: 4.6,
      variants: {
        create: [
          { name: '100ml', price: 22.00, stock: 80 }
        ]
      }
    },
    {
      title: 'Hyaluronic Acid Hydration Boost Serum',
      slug: 'hyaluronic-acid-hydration-boost-serum',
      description: 'A high-potency serum containing multi-molecular weight Hyaluronic Acid and Vitamin B5. It penetrates deep into skin layers to plump fine lines, restore moisture reservoirs, and deliver bouncy skin.',
      price: 26.00,
      brand: 'GlowGuide Care',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop',
      skinType: 'dry',
      concern: 'hydration',
      ingredients: 'Sodium Hyaluronate (Multi-Weight), Panthenol (Vitamin B5), Phenoxyethanol, Ethylhexylglycerin, Purified Water',
      categoryId: serumCat.id,
      rating: 4.9,
      variants: {
        create: [
          { name: '30ml', price: 26.00, stock: 150 },
          { name: '50ml Double', price: 39.00, stock: 60 }
        ]
      }
    },
    {
      title: 'Vitamin C Brightening Fluid',
      slug: 'vitamin-c-brightening-fluid',
      description: 'Enriched with 15% pure L-Ascorbic Acid and Ferulic Acid, this powerful antioxidant serum neutralizes free radicals, fades dark spots and hyperpigmentation, and dramatically improves skin radiance.',
      price: 29.00,
      brand: 'GlowGuide Active',
      image: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=400&auto=format&fit=crop',
      skinType: 'combination',
      concern: 'brightening',
      ingredients: 'L-Ascorbic Acid 15%, Ferulic Acid, Tocopherol (Vitamin E), Ethoxydiglycol, Panthenol, Hyaluronic Acid',
      categoryId: serumCat.id,
      rating: 4.7,
      variants: {
        create: [
          { name: '30ml', price: 29.00, stock: 100 }
        ]
      }
    },
    {
      title: 'Retinol Youth Renewal Night Cream',
      slug: 'retinol-youth-renewal-night-cream',
      description: 'An advanced retinol cream engineered for night-time repair. Microencapsulated retinol speeds skin cell turnover to reduce appearance of wrinkles, while peptides support collagen synthesis.',
      price: 38.00,
      brand: 'GlowGuide Active',
      image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=400&auto=format&fit=crop',
      skinType: 'combination',
      concern: 'aging',
      ingredients: 'Retinol (Microencapsulated), Acetyl Hexapeptide-8, Niacinamide, Shea Butter, Ceramides NP/AP/EOP',
      categoryId: moisturizerCat.id,
      rating: 4.5,
      variants: {
        create: [
          { name: '50ml', price: 38.00, stock: 75 }
        ]
      }
    },
    {
      title: 'Ceramide Barrier Repair Cream',
      slug: 'ceramide-barrier-repair-cream',
      description: 'A rich, nourishing daily moisturizer that delivers 3 essential ceramides and cholesterol. Fast-absorbing lipids strengthen dry or sensitised skin barriers and provide 48-hour locked hydration.',
      price: 32.00,
      brand: 'GlowGuide Care',
      image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=400&auto=format&fit=crop',
      skinType: 'dry',
      concern: 'hydration',
      ingredients: 'Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Squalane, Glycerin',
      categoryId: moisturizerCat.id,
      rating: 4.9,
      variants: {
        create: [
          { name: '80ml tube', price: 32.00, stock: 110 }
        ]
      }
    },
    {
      title: 'Mineral Matte Sunscreen SPF 50',
      slug: 'mineral-matte-sunscreen-spf-50',
      description: 'A physical zinc-oxide sunscreen providing broad-spectrum UVA/UVB protection. The lightweight, oil-free formula sets to a beautiful matte finish that acts as a perfect primer. Safe for sensitive skin.',
      price: 24.00,
      brand: 'GlowGuide Protection',
      image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400&auto=format&fit=crop',
      skinType: 'oily',
      concern: 'aging',
      ingredients: 'Zinc Oxide 20%, Titanium Dioxide, Cyclopentasiloxane, Dimethicone Crosspolymer, Vitamin E, Bisabolol',
      categoryId: sunscreenCat.id,
      rating: 4.7,
      variants: {
        create: [
          { name: '50ml', price: 24.00, stock: 130 }
        ]
      }
    },
    {
      title: 'Clarifying Tea Tree Spot Gel',
      slug: 'clarifying-tea-tree-spot-gel',
      description: 'A target spot treatment gel with Tea Tree oil and Centella to immediately soothe acne blemishes, reduce size of pimples overnight, and prevent post-acne scarring without drying surrounding skin.',
      price: 19.00,
      brand: 'GlowGuide Care',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=400&auto=format&fit=crop',
      skinType: 'sensitive',
      concern: 'acne',
      ingredients: 'Tea Tree Oil, Centella Asiatica, Niacinamide 4%, Salicylic Acid 0.5%, Witch Hazel, Zinc PCA',
      categoryId: serumCat.id,
      rating: 4.6,
      variants: {
        create: [
          { name: '15ml', price: 19.00, stock: 90 }
        ]
      }
    }
  ];

  for (const product of productsData) {
    const createdProduct = await prisma.product.create({
      data: product,
    });
    console.log(`Seeded product: ${createdProduct.title}`);

    // Seed a couple of default reviews for each product
    await prisma.review.create({
      data: {
        productId: createdProduct.id,
        userId: customer.id,
        rating: 5,
        comment: `Excellent product! Truly transformed my skincare routine. My skin concerns are totally addressed by this, highly recommend it to anyone with ${product.skinType} skin.`,
      }
    });

    await prisma.review.create({
      data: {
        productId: createdProduct.id,
        userId: customer.id,
        rating: 4,
        comment: `Overall a really solid product. It is lightweight, doesn't break me out, and works well under makeup. Will purchase again!`,
      }
    });
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
