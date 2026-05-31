// src/models/Cart.model.js
import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const CartItemSchema = new Schema(
  {
    product: {
      type:     Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
    },
    variant: {
      type:    Schema.Types.ObjectId,
      default: null,
    },
    quantity: {
      type:    Number,
      required:true,
      min:     1,
      default: 1,
    },
    addedAt: {
      type:    Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const CartSchema = new Schema(
  {
    /** Null for guest carts — identified by sessionId instead */
    user: {
      type:   Schema.Types.ObjectId,
      ref:    "User",
      sparse: true,
      unique: true,
    },
    /** Anonymous / guest identifier (cookie value) */
    sessionId: {
      type:   String,
      sparse: true,
      unique: true,
    },
    items: {
      type:    [CartItemSchema],
      default: [],
    },
    couponCode: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
);

// ── Validation: must have user OR sessionId ───────────────────────────────────
CartSchema.pre("validate", function (next) {
  if (!this.user && !this.sessionId) {
    return next(new Error("Cart must belong to a user or have a sessionId"));
  }
  next();
});

// ── Indexes ───────────────────────────────────────────────────────────────────
CartSchema.index({ user:      1 }, { sparse: true, unique: true });
CartSchema.index({ sessionId: 1 }, { sparse: true, unique: true });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for guest carts

// ── Virtuals ──────────────────────────────────────────────────────────────────
CartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

// ── Instance methods ──────────────────────────────────────────────────────────

/** Adds or increments an item. Deduplicates by product + variant. */
CartSchema.methods.addItem = function (productId, variantId = null, qty = 1) {
  const existing = this.items.find(
    (i) =>
      i.product.equals(productId) &&
      (variantId ? i.variant?.equals(variantId) : !i.variant)
  );
  if (existing) {
    existing.quantity += qty;
  } else {
    this.items.push({ product: productId, variant: variantId, quantity: qty });
  }
  return this.save();
};

/** Removes an item by its CartItem _id */
CartSchema.methods.removeItem = function (cartItemId) {
  this.items = this.items.filter((i) => !i._id.equals(cartItemId));
  return this.save();
};

/** Updates quantity of an item; removes it if qty <= 0 */
CartSchema.methods.updateQuantity = function (cartItemId, qty) {
  if (qty <= 0) return this.removeItem(cartItemId);
  const item = this.items.id(cartItemId);
  if (item) { item.quantity = qty; }
  return this.save();
};

/** Empties the cart */
CartSchema.methods.clear = function () {
  this.items      = [];
  this.couponCode = null;
  return this.save();
};

const Cart = models.Cart ?? model("Cart", CartSchema);
export default Cart;
