// src/models/Product.model.js
import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

// ── Sub-schemas ──────────────────────────────────────────────────────────────

/** A single product image entry */
const ImageSchema = new Schema(
  {
    url:      { type: String, required: true },
    alt:      { type: String, default: ""    },
    position: { type: Number, default: 0     }, // sort order in gallery
  },
  { _id: false }
);

/** A purchasable variant (size + colour combination) */
const VariantSchema = new Schema(
  {
    name:      { type: String, required: true }, // e.g. "Red / XL"
    sku:       { type: String, sparse: true, unique: true },
    priceDelta:{ type: Number, default: 0 },     // added to base price; may be negative
    stockQty:  { type: Number, default: 0, min: 0 },
    attributes:{ type: Map, of: String },        // { color: "Red", size: "XL" }
    imageUrl:  { type: String },
    isActive:  { type: Boolean, default: true },
  },
  { _id: true, timestamps: { createdAt: "createdAt", updatedAt: false } }
);

// ── Main schema ──────────────────────────────────────────────────────────────

const ProductSchema = new Schema(
  {
    // ── Identity ────────────────────────────────────────────────────────────
    seller: {
      type: Schema.Types.ObjectId,
      ref:  "User",
      required: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref:  "Category",
      default: null,
    },
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    slug: {
      type:     String,
      required: true,
      unique:   true,
      lowercase:true,
      trim:     true,
    },
    brand: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },

    // ── Pricing ──────────────────────────────────────────────────────────────
    price: {
      type:     Number,
      required: true,
      min:      0,
    },
    /** Strike-through "was" price shown when discounted */
    comparePrice: {
      type:    Number,
      default: null,
      min:     0,
    },
    currency: {
      type:    String,
      default: "GBP",
      uppercase: true,
      maxlength: 3,
    },
    /** Percentage or fixed badge — null means no promotional tag */
    discountType: {
      type: String,
      enum: ["percentage", "fixed", null],
      default: null,
    },

    // ── Inventory ────────────────────────────────────────────────────────────
    sku: {
      type:   String,
      sparse: true,
      unique: true,
    },
    stockQty: {
      type:    Number,
      default: 0,
      min:     0,
    },
    /** Convenience flag — kept in sync with stockQty via pre-save hook */
    inStock: {
      type:    Boolean,
      default: true,
    },

    // ── Taxonomy & discovery ─────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["draft", "active", "archived"],
      default: "draft",
      index:   true,
    },
    /** Promo badge: "NEW" | "SALE" | "SOLD OUT" | "LIMITED" | "EXCLUSIVE" | null */
    badge: {
      type:    String,
      enum:    ["NEW", "SALE", "SOLD OUT", "LIMITED", "EXCLUSIVE", null],
      default: null,
    },
    sizes: {
      type:    [String],
      default: [],
    },
    tags: {
      type:  [String],
      index: true,
    },

    // ── Media ────────────────────────────────────────────────────────────────
    images: {
      type:    [ImageSchema],
      default: [],
    },
    /** HSL placeholder colour for when no image is available */
    placeholderColor: {
      type:    String,
      default: "hsl(30, 18%, 82%)",
    },

    // ── Physical attributes ──────────────────────────────────────────────────
    weightKg: {
      type:    Number,
      default: null,
    },

    // ── Variants ─────────────────────────────────────────────────────────────
    variants: {
      type:    [VariantSchema],
      default: [],
    },

    // ── Social proof ─────────────────────────────────────────────────────────
    /** Denormalised rating average — updated by a post-save hook on Review */
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count:   { type: Number, default: 0, min: 0 },
    },

    // ── Metadata ─────────────────────────────────────────────────────────────
    metadata: {
      type:    Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps:     true,                    // createdAt, updatedAt
    versionKey:     "__v",
    toJSON:         { virtuals: true },
    toObject:       { virtuals: true },
  }
);

// ── Virtuals ─────────────────────────────────────────────────────────────────

/** Discount percentage for display (e.g. 30 → "30% OFF") */
ProductSchema.virtual("discountPercent").get(function () {
  if (!this.comparePrice || this.comparePrice <= this.price) return null;
  return Math.round((1 - this.price / this.comparePrice) * 100);
});

/** Resolved primary image URL or null */
ProductSchema.virtual("primaryImage").get(function () {
  return this.images?.[0]?.url ?? null;
});

// ── Indexes ───────────────────────────────────────────────────────────────────

ProductSchema.index({ slug:     1  });
ProductSchema.index({ seller:   1, status: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ status:   1, "rating.average": -1 });
ProductSchema.index({ tags:     1  });
ProductSchema.index({ name: "text", description: "text" });  // full-text search

// ── Pre-save hooks ────────────────────────────────────────────────────────────

/** Keep inStock flag in sync with stockQty */
ProductSchema.pre("save", function (next) {
  if (this.isModified("stockQty") || this.isNew) {
    this.inStock = this.stockQty > 0;
    if (!this.inStock && this.badge !== "SOLD OUT") {
      this.badge = "SOLD OUT";
    }
  }
  next();
});

/** Auto-generate slug from name if not provided */
ProductSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// ── Static helpers ────────────────────────────────────────────────────────────

/**
 * Returns the active products page for a given category slug.
 * @param {string}  categoryId
 * @param {object}  options
 */
ProductSchema.statics.findByCategory = function (categoryId, options = {}) {
  const { page = 1, limit = 12, sort = "-createdAt" } = options;
  return this.find({ category: categoryId, status: "active" })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("seller", "name avatar");
};

/**
 * Full-text search across name and description.
 * @param {string} query
 */
ProductSchema.statics.search = function (query, options = {}) {
  const { page = 1, limit = 12 } = options;
  return this.find(
    { $text: { $search: query }, status: "active" },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .skip((page - 1) * limit)
    .limit(limit);
};

// ── Model export ──────────────────────────────────────────────────────────────

const Product = models.Product ?? model("Product", ProductSchema);
export default Product;
