import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.join(__dirname, 'data', 'db.json')

const defaultCategories = [
  { id: 'cat-women', name: "Women's Wear", slug: 'women', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400' },
  { id: 'cat-men', name: "Men's Wear", slug: 'men', image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400' },
  { id: 'cat-kids', name: 'Kids', slug: 'kids', image: 'https://images.unsplash.com/photo-1560506840-ec148e82a604?w=400' },
  { id: 'cat-footwear', name: 'Footwear', slug: 'footwear', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400' },
  { id: 'cat-accessories', name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1611923134239-b9be5816ff5e?w=400' },
  { id: 'cat-sale', name: 'Sale', slug: 'sale', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
]

const defaultProducts = [
  {
    id: 'prod-1',
    title: 'Floral Summer Dress — Airy Cotton',
    description: 'Breezy floral midi dress in lightweight cotton voile. Tiered ruffles, adjustable straps, perfect for brunch or vacation.',
    price: 49.99,
    originalPrice: 79.99,
    category: 'women',
    brand: 'Étoile',
    images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600', 'https://images.unsplash.com/photo-1515372039744-3c71ace6ad4a?w=600'],
    rating: 4.7,
    reviewsCount: 1242,
    stock: 85,
    isFeatured: true,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    title: 'Oversized Denim Jacket — Vintage Wash',
    description: 'Classic oversized denim jacket with distressed details, dropped shoulders and 100% organic cotton. Year-round layer.',
    price: 69.99,
    originalPrice: 99.99,
    category: 'women',
    brand: 'Denim & Co',
    images: ['https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600', 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=600'],
    rating: 4.5,
    reviewsCount: 892,
    stock: 120,
    isFeatured: true,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    title: 'Slim Fit Oxford Cotton Shirt',
    description: 'Crisp slim-fit Oxford shirt in breathable cotton. Button-down collar, perfect for office or casual Friday.',
    price: 39.99,
    originalPrice: 59.99,
    category: 'men',
    brand: 'Nordic Thread',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'],
    rating: 4.6,
    reviewsCount: 640,
    stock: 140,
    isFeatured: true,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    title: 'High-Waist Mom Jeans — Light Fade',
    description: 'High-waist relaxed mom jeans with 5-pocket styling and light wash. Comfortable stretch denim.',
    price: 59.99,
    originalPrice: 89.99,
    category: 'women',
    brand: 'UrbanStep Denim',
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'],
    rating: 4.4,
    reviewsCount: 567,
    stock: 95,
    isFeatured: false,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    title: 'Wool Blend Overcoat — Camel',
    description: 'Tailored wool-blend overcoat in camel with notch lapels, internal lining and side pockets. Winter essential.',
    price: 149.99,
    originalPrice: 219.99,
    category: 'men',
    brand: 'Bourbon & Oak',
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600'],
    rating: 4.8,
    reviewsCount: 312,
    stock: 32,
    isFeatured: true,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    title: 'Kids Rainbow Hoodie — Cozy Fleece',
    description: 'Color-block rainbow hoodie for kids in soft fleece. Kangaroo pocket, ribbed cuffs — playground favorite.',
    price: 29.99,
    originalPrice: 44.99,
    category: 'kids',
    brand: 'MiniMuse',
    images: ['https://images.unsplash.com/photo-1560506840-ec148e82a604?w=600', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600'],
    rating: 4.7,
    reviewsCount: 210,
    stock: 200,
    isFeatured: false,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-7',
    title: 'Leather Crossbody Bag — Tan',
    description: 'Minimal tan crossbody with adjustable strap, magnetic flap and multiple compartments. Genuine leather.',
    price: 64.99,
    originalPrice: 89.99,
    category: 'accessories',
    brand: 'Carry Studio',
    images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'],
    rating: 4.6,
    reviewsCount: 478,
    stock: 60,
    isFeatured: true,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-8',
    title: 'White Chunky Sneakers — Cloud Step',
    description: 'Chunky white sneakers with breathable mesh, cushioned sole and platform height. Street-style staple.',
    price: 74.99,
    originalPrice: 109.99,
    category: 'footwear',
    brand: 'UrbanStep',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 'https://images.unsplash.com/photo-1606890658317-7d14490b76fd?w=600'],
    rating: 4.5,
    reviewsCount: 980,
    stock: 110,
    isFeatured: true,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-9',
    title: 'Silk Blend Saree — Modern Drape',
    description: 'Lightweight silk blend saree with subtle zari border and blouse piece included. Elegant for festivities.',
    price: 89.99,
    originalPrice: 129.99,
    category: 'women',
    brand: 'Avara',
    images: ['https://images.unsplash.com/photo-1583391733956-3750e79ff55e?w=600', 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600'],
    rating: 4.9,
    reviewsCount: 340,
    stock: 45,
    isFeatured: true,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-10',
    title: 'Striped Linen Kurta — Relaxed Fit',
    description: 'Breathable striped linen kurta with mandarin collar and side slits. Effortless summer wear for men.',
    price: 44.99,
    originalPrice: 69.99,
    category: 'men',
    brand: 'Loom & Leaf',
    images: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600', 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=600'],
    rating: 4.4,
    reviewsCount: 290,
    stock: 75,
    isFeatured: false,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-11',
    title: 'Athleisure Track Pants — Tapered',
    description: 'Tapered track pants with 4-way stretch, zip pockets and breathable dry-fit. Gym to street.',
    price: 34.99,
    originalPrice: 54.99,
    category: 'men',
    brand: 'Velocity',
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'],
    rating: 4.3,
    reviewsCount: 520,
    stock: 130,
    isFeatured: false,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-12',
    title: 'Knitted Winter Sweater — Oat',
    description: 'Chunky knit sweater in oat with crew neck and dropped shoulders. Cozy and oversized fit.',
    price: 54.99,
    originalPrice: 79.99,
    category: 'women',
    brand: 'Wool & Whimsy',
    images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600', 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600'],
    rating: 4.6,
    reviewsCount: 410,
    stock: 66,
    isFeatured: false,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-13',
    title: 'Classic Leather Loafers — Brown',
    description: 'Hand-finished leather loafers with penny stitching and cushioned footbed. Formal to casual.',
    price: 94.99,
    originalPrice: 139.99,
    category: 'footwear',
    brand: 'Heritage Step',
    images: ['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600'],
    rating: 4.7,
    reviewsCount: 620,
    stock: 48,
    isFeatured: true,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-14',
    title: 'Gold Hoop Earrings Set (3 pcs)',
    description: 'Hypoallergenic gold-plated hoops in small, medium, large. Lightweight, tarnish-resistant.',
    price: 18.99,
    originalPrice: 29.99,
    category: 'accessories',
    brand: 'Glimmer',
    images: ['https://images.unsplash.com/photo-1611923134239-b9be5816ff5e?w=600', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600'],
    rating: 4.5,
    reviewsCount: 810,
    stock: 300,
    isFeatured: false,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-15',
    title: 'Cargo Utility Pants — Olive',
    description: 'Olive cargo pants with multiple pockets, straight leg and durable canvas. Utility chic.',
    price: 49.99,
    originalPrice: 74.99,
    category: 'men',
    brand: 'Utility & Co',
    images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600', 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=600'],
    rating: 4.4,
    reviewsCount: 330,
    stock: 88,
    isFeatured: false,
    vendorId: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-16',
    title: 'Pleated Midi Skirt — Sage',
    description: 'Flowy pleated midi skirt in sage with elastic waist and lining. Office to evening versatility.',
    price: 42.99,
    originalPrice: 64.99,
    category: 'women',
    brand: 'Étoile',
    images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600'],
    rating: 4.6,
    reviewsCount: 274,
    stock: 70,
    isFeatured: true,
    vendorId: null,
    createdAt: new Date().toISOString()
  }
]

function createFreshDb() {
  const now = new Date().toISOString()
  const users = [
    { id: uuid(), name: 'Admin User', email: 'admin@shop.com', phone: null, passwordHash: bcrypt.hashSync('admin123', 10), role: 'admin', createdAt: now, addresses: [] },
    { id: uuid(), name: 'Vendor One', email: 'vendor@shop.com', phone: null, passwordHash: bcrypt.hashSync('vendor123', 10), role: 'vendor', createdAt: now, addresses: [] },
    { id: uuid(), name: 'Delivery Guy', email: 'delivery@shop.com', phone: null, passwordHash: bcrypt.hashSync('delivery123', 10), role: 'delivery', createdAt: now, addresses: [] },
    { id: uuid(), name: 'Demo User', email: 'user@shop.com', phone: '9876543210', passwordHash: bcrypt.hashSync('user123', 10), role: 'user', createdAt: now, addresses: [] },
  ]
  return {
    users,
    categories: defaultCategories,
    products: defaultProducts,
    carts: {},
    wishlists: {},
    orders: [],
    reviews: [
      { id: uuid(), productId: 'prod-1', userId: users[3].id, userName: 'Demo User', rating: 5, comment: 'Beautiful dress! Fabric is so soft and flowy.', createdAt: now },
      { id: uuid(), productId: 'prod-1', userId: users[0].id, userName: 'Admin User', rating: 4, comment: 'Great fit and value for money.', createdAt: now }
    ]
  }
}

function ensureDb() {
  if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  if (!fs.existsSync(DB_PATH)) {
    const db = createFreshDb()
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8')
  const parsed = JSON.parse(raw)
  let needsSave = false

  // migrate: add phone field if missing
  if (parsed.users) {
    for (const u of parsed.users) {
      if (!('phone' in u)) { u.phone = null; needsSave = true }
      if (!('addresses' in u)) { u.addresses = []; needsSave = true }
    }
  }
  // migrate categories & products if old slugs detected (fashion store migration)
  const hasOldCats = parsed.categories?.some(c => ['electronics','home','sports','books','beauty'].includes(c.slug))
  if (hasOldCats) {
    parsed.categories = defaultCategories
    parsed.products = defaultProducts
    // keep custom reviews but ensure productId exists
    needsSave = true
  }
  // ensure at least 6 categories exist
  if (!parsed.categories || parsed.categories.length < 6) {
    parsed.categories = defaultCategories
    needsSave = true
  }
  if (needsSave) {
    fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2))
  }
  return parsed
}

function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

let dbCache = ensureDb()

export function getDb() {
  return dbCache
}

export function setDb(newDb) {
  dbCache = newDb
  saveDb(dbCache)
}

export function reloadDb() {
  dbCache = ensureDb()
  return dbCache
}

export function writeDb() {
  saveDb(dbCache)
}
