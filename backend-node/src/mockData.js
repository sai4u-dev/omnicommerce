const mockCategories = [
  { id: "cat-1", name: 'Cleansers', slug: 'cleansers', description: 'Gentle and effective cleansers for all skin types' },
  { id: "cat-2", name: 'Toners', slug: 'toners', description: 'Hydrating and clarifying skin toners' },
  { id: "cat-3", name: 'Serums & Treatments', slug: 'serums-treatments', description: 'Active treatments targeted for specific concerns' },
  { id: "cat-4", name: 'Moisturizers', slug: 'moisturizers', description: 'Nourishing creams and lotions to lock in hydration' },
  { id: "cat-5", name: 'Sunscreens', slug: 'sunscreens', description: 'Broad-spectrum physical and chemical UV filters' }
];

const mockProducts = [
  {
    id: 'mock-1',
    title: 'Centella Gentle Foam Cleanser',
    slug: 'centella-gentle-foam-cleanser',
    description: 'A mild pH-balanced foaming cleanser infused with Centella Asiatica extract. It sweeps away impurities while leaving the skin barrier intact, hydrated, and calm. Ideal for daily use morning and night.',
    price: 18.00,
    brand: 'GlowGuide Care',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400&auto=format&fit=crop',
    skinType: 'sensitive',
    concern: 'hydration',
    ingredients: 'Centella Asiatica Extract, Glycerin, Sodium Cocoyl Isethionate, Coco-Betaine, Panthenol, Allantoin',
    categoryId: 'cat-1',
    rating: 4.8,
    category: mockCategories[0],
    variants: [
      { id: 'var-1', name: '150ml', price: 18.00, stock: 120 },
      { id: 'var-2', name: '250ml Value Size', price: 28.00, stock: 45 }
    ],
    reviews: [
      { id: 'r-1', rating: 5, comment: 'Excellent product! Truly transformed my skincare routine. Highly recommend it to anyone with sensitive skin.', createdAt: new Date() },
      { id: 'r-2', rating: 4, comment: 'Overall a really solid product. It is lightweight, doesn\'t break me out, and works well under makeup.', createdAt: new Date() }
    ]
  },
  {
    id: 'mock-2',
    title: 'BHA Pore Refining Toner',
    slug: 'bha-pore-refining-toner',
    description: 'Formulated with 2% Salicylic Acid (BHA), this toner gently exfoliates dead skin cells, targets blackheads, and controls excess oil secretion. Tea tree oil helps calm redness and breakouts.',
    price: 22.00,
    brand: 'GlowGuide Active',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop',
    skinType: 'oily',
    concern: 'acne',
    ingredients: 'Salicylic Acid 2%, Water, Methylpropanediol, Tea Tree Leaf Oil, Green Tea Extract, Sodium Hyaluronate',
    categoryId: 'cat-2',
    rating: 4.6,
    category: mockCategories[1],
    variants: [
      { id: 'var-3', name: '100ml', price: 22.00, stock: 80 }
    ],
    reviews: [
      { id: 'r-3', rating: 5, comment: 'Really cleared up my blackheads and keeps the oil production in check. A holy grail product!', createdAt: new Date() }
    ]
  },
  {
    id: 'mock-3',
    title: 'Hyaluronic Acid Hydration Boost Serum',
    slug: 'hyaluronic-acid-hydration-boost-serum',
    description: 'A high-potency serum containing multi-molecular weight Hyaluronic Acid and Vitamin B5. It penetrates deep into skin layers to plump fine lines, restore moisture reservoirs, and deliver bouncy skin.',
    price: 26.00,
    brand: 'GlowGuide Care',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop',
    skinType: 'dry',
    concern: 'hydration',
    ingredients: 'Sodium Hyaluronate (Multi-Weight), Panthenol (Vitamin B5), Phenoxyethanol, Ethylhexylglycerin, Purified Water',
    categoryId: 'cat-3',
    rating: 4.9,
    category: mockCategories[2],
    variants: [
      { id: 'var-4', name: '30ml', price: 26.00, stock: 150 },
      { id: 'var-5', name: '50ml Double', price: 39.00, stock: 60 }
    ],
    reviews: [
      { id: 'r-4', rating: 5, comment: 'My skin was peeling and dry, and this serum plumped it right back up. Cannot live without it.', createdAt: new Date() }
    ]
  },
  {
    id: 'mock-4',
    title: 'Vitamin C Brightening Fluid',
    slug: 'vitamin-c-brightening-fluid',
    description: 'Enriched with 15% pure L-Ascorbic Acid and Ferulic Acid, this powerful antioxidant serum neutralizes free radicals, fades dark spots and hyperpigmentation, and dramatically improves skin radiance.',
    price: 29.00,
    brand: 'GlowGuide Active',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=400&auto=format&fit=crop',
    skinType: 'combination',
    concern: 'brightening',
    ingredients: 'L-Ascorbic Acid 15%, Ferulic Acid, Tocopherol (Vitamin E), Ethoxydiglycol, Panthenol, Hyaluronic Acid',
    categoryId: 'cat-3',
    rating: 4.7,
    category: mockCategories[2],
    variants: [
      { id: 'var-6', name: '30ml', price: 29.00, stock: 100 }
    ],
    reviews: [
      { id: 'r-5', rating: 5, comment: 'Faded my post-acne marks in just a few weeks. Best Vitamin C I have ever used.', createdAt: new Date() }
    ]
  },
  {
    id: 'mock-5',
    title: 'Retinol Youth Renewal Night Cream',
    slug: 'retinol-youth-renewal-night-cream',
    description: 'An advanced retinol cream engineered for night-time repair. Microencapsulated retinol speeds skin cell turnover to reduce appearance of wrinkles, while peptides support collagen synthesis.',
    price: 38.00,
    brand: 'GlowGuide Active',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=400&auto=format&fit=crop',
    skinType: 'combination',
    concern: 'aging',
    ingredients: 'Retinol (Microencapsulated), Acetyl Hexapeptide-8, Niacinamide, Shea Butter, Ceramides NP/AP/EOP',
    categoryId: 'cat-4',
    rating: 4.5,
    category: mockCategories[3],
    variants: [
      { id: 'var-7', name: '50ml', price: 38.00, stock: 75 }
    ],
    reviews: [
      { id: 'r-6', rating: 4, comment: 'Very gentle retinol. Did not cause any purging or peeling. Seeing lines soften after a month.', createdAt: new Date() }
    ]
  },
  {
    id: 'mock-6',
    title: 'Ceramide Barrier Repair Cream',
    slug: 'ceramide-barrier-repair-cream',
    description: 'A rich, nourishing daily moisturizer that delivers 3 essential ceramides and cholesterol. Fast-absorbing lipids strengthen dry or sensitised skin barriers and provide 48-hour locked hydration.',
    price: 32.00,
    brand: 'GlowGuide Care',
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=400&auto=format&fit=crop',
    skinType: 'dry',
    concern: 'hydration',
    ingredients: 'Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Squalane, Glycerin',
    categoryId: 'cat-4',
    rating: 4.9,
    category: mockCategories[3],
    variants: [
      { id: 'var-8', name: '80ml tube', price: 32.00, stock: 110 }
    ],
    reviews: [
      { id: 'r-7', rating: 5, comment: 'Saved my skin when I over-exfoliated. Deeply hydrating without feeling heavy.', createdAt: new Date() }
    ]
  },
  {
    id: 'mock-7',
    title: 'Mineral Matte Sunscreen SPF 50',
    slug: 'mineral-matte-sunscreen-spf-50',
    description: 'A physical zinc-oxide sunscreen providing broad-spectrum UVA/UVB protection. The lightweight, oil-free formula sets to a beautiful matte finish that acts as a perfect primer. Safe for sensitive skin.',
    price: 24.00,
    brand: 'GlowGuide Protection',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400&auto=format&fit=crop',
    skinType: 'oily',
    concern: 'aging',
    ingredients: 'Zinc Oxide 20%, Titanium Dioxide, Cyclopentasiloxane, Dimethicone Crosspolymer, Vitamin E, Bisabolol',
    categoryId: 'cat-5',
    rating: 4.7,
    category: mockCategories[4],
    variants: [
      { id: 'var-9', name: '50ml', price: 24.00, stock: 130 }
    ],
    reviews: [
      { id: 'r-8', rating: 5, comment: 'Finally a mineral sunscreen that does not leave a white cast and keeps my oily face matte all day.', createdAt: new Date() }
    ]
  },
  {
    id: 'mock-8',
    title: 'Clarifying Tea Tree Spot Gel',
    slug: 'clarifying-tea-tree-spot-gel',
    description: 'A target spot treatment gel with Tea Tree oil and Centella to immediately soothe acne blemishes, reduce size of pimples overnight, and prevent post-acne scarring without drying surrounding skin.',
    price: 19.00,
    brand: 'GlowGuide Care',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=400&auto=format&fit=crop',
    skinType: 'sensitive',
    concern: 'acne',
    ingredients: 'Tea Tree Oil, Centella Asiatica, Niacinamide 4%, Salicylic Acid 0.5%, Witch Hazel, Zinc PCA',
    categoryId: 'cat-3',
    rating: 4.6,
    category: mockCategories[2],
    variants: [
      { id: 'var-10', name: '15ml', price: 19.00, stock: 90 }
    ],
    reviews: [
      { id: 'r-9', rating: 5, comment: 'Reduces the size of red blemishes overnight. Incredible spot gel.', createdAt: new Date() }
    ]
  }
];

// In-memory orders/users databases for fallback operation
const mockUsers = [
  { id: "usr-1", email: "customer@glowguide.com", name: "Sai Narendra", role: "customer" },
  { id: "usr-2", email: "admin@glowguide.com", name: "Admin GlowGuide", role: "admin" }
];

const mockOrders = [
  {
    id: "ord-1",
    userId: "usr-1",
    totalPrice: 58.00,
    status: "paid",
    paymentStatus: "paid",
    shippingAddr: "123 Aesthetic St, New York, ZIP: 10001",
    trackingNo: "GG-392812",
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    user: mockUsers[0],
    items: [
      { id: "itm-1", productId: "mock-1", quantity: 1, price: 18.00, product: mockProducts[0] },
      { id: "itm-2", productId: "mock-5", quantity: 1, price: 38.00, product: mockProducts[4] }
    ]
  }
];

module.exports = {
  mockCategories,
  mockProducts,
  mockUsers,
  mockOrders
};
