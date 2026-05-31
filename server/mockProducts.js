// src/data/mockProducts.js

/**
 * Static reference arrays used to build mock product objects.
 * In production these would come from the MongoDB API via Redux.
 */
const PRODUCT_NAMES = [
  "Oversized Wool Coat",    "Silk Slip Dress",      "Tailored Blazer",
  "Cashmere Turtleneck",    "Wide Leg Trousers",    "Linen Shirt Dress",
  "Leather Moto Jacket",    "Ribbed Midi Skirt",    "Cropped Cardigan",
  "Wrap Maxi Dress",        "Denim Jacket",         "Satin Blouse",
  "Knit Co-ord Set",        "Pleated Culottes",     "Shearling Vest",
  "Broderie Dress",         "Trench Coat",          "Jersey Maxi Skirt",
  "Cutout Bodysuit",        "Velvet Blazer",        "Cargo Trousers",
  "Smocked Top",            "Faux Fur Coat",        "Slip Skirt",
];

const BRANDS   = ["MAISON", "ATELIER", "STUDIO", "HAUS", "NOIR", "BLANC"];
const PRICES   = [89, 129, 189, 245, 320, 420, 550, 680, 790, 890, 1100, 1450];
const TAGS     = ["NEW", "SALE", "SOLD OUT", "LIMITED", "EXCLUSIVE"];
const CATS     = ["Outerwear", "Dresses", "Tops", "Bottoms", "Sets"];
const ALL_SIZES = ["XS", "S", "M", "L", "XL"];

/**
 * Generates a page of deterministic mock products.
 *
 * @param {number} page     - Zero-based page index.
 * @param {number} perPage  - Items per page (default 12).
 * @returns {Array<MockProduct>}
 */
export function generateProducts(page, perPage = 12) {
  return Array.from({ length: perPage }, (_, i) => {
    const id  = page * perPage + i;
    const hue = (id * 47) % 360;
    const sat = 10 + (id % 3) * 8;
    const lum = 78 + (id % 4) * 4;

    const price         = PRICES[id % PRICES.length];
    const hasDiscount   = (id % 3) === 0;                          // deterministic, not random
    const originalPrice = hasDiscount ? PRICES[(id + 3) % PRICES.length] : null;
    const hasTag        = (id % 4) !== 0;

    return {
      /** MongoDB _id equivalent – string of numeric id for mock use */
      id: String(id),

      // ── Identification ────────────────────────────────────────────────────
      name:     PRODUCT_NAMES[id % PRODUCT_NAMES.length],
      brand:    BRANDS[id % BRANDS.length],
      slug:     `${BRANDS[id % BRANDS.length].toLowerCase()}-${id}`,
      category: CATS[id % CATS.length],

      // ── Pricing ──────────────────────────────────────────────────────────
      price,
      originalPrice,
      currency: "GBP",

      // ── Visuals ──────────────────────────────────────────────────────────
      /** HSL colour used as placeholder background */
      color:       `hsl(${hue},${sat}%,${lum}%)`,
      accentColor: `hsl(${hue},${sat + 10}%,${lum - 20}%)`,
      /** Product image URLs (empty array = use colour placeholder) */
      images: [],

      // ── Taxonomy ─────────────────────────────────────────────────────────
      tag:   hasTag ? TAGS[id % TAGS.length] : null,
      sizes: ALL_SIZES.slice(id % 3, (id % 3) + 3 + (id % 2)),
      tags:  [],

      // ── Social proof ─────────────────────────────────────────────────────
      rating:      parseFloat((3.5 + (id % 5) * 0.3).toFixed(1)),
      reviewCount: 12 + (id * 7) % 340,

      // ── State ────────────────────────────────────────────────────────────
      isWishlisted: false,
      inStock:      (id % 7) !== 0,
      stockQty:     (id % 7) === 0 ? 0 : 5 + (id % 20),
    };
  });
}
