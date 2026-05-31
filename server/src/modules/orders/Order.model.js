// src/models/Order.model.js
import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

// ── Address snapshot (copied at checkout — immutable) ─────────────────────────
const AddressSnapshotSchema = new Schema(
  {
    fullName:   { type: String, required: true },
    line1:      { type: String, required: true },
    line2:      { type: String },
    city:       { type: String, required: true },
    state:      { type: String },
    postalCode: { type: String, required: true },
    country:    { type: String, required: true, maxlength: 2 },
    phone:      { type: String },
  },
  { _id: false }
);

// ── Line-item snapshot (prices & names locked at purchase time) ───────────────
const OrderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref:  "Product",
      default: null,               // may become null if product deleted
    },
    seller: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    variant: {
      type:    Schema.Types.ObjectId,
      default: null,
    },
    // ── Immutable snapshots ─────────────────────────────────────────────────
    productName: { type: String, required: true },
    variantName: { type: String },
    sku:         { type: String },
    imageUrl:    { type: String },
    unitPrice:   { type: Number, required: true, min: 0 },
    quantity:    { type: Number, required: true, min: 1 },
    totalPrice:  { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

// ── Payment attempt sub-document ──────────────────────────────────────────────
const PaymentSchema = new Schema(
  {
    gateway:          { type: String, required: true }, // stripe | razorpay | paypal
    gatewayPaymentId: { type: String, required: true },
    amount:           { type: Number, required: true, min: 0 },
    currency:         { type: String, required: true, maxlength: 3 },
    status:           { type: String, required: true }, // succeeded | failed | pending | refunded
    method:           { type: String },                 // card | upi | wallet
    metadata:         { type: Schema.Types.Mixed },     // raw webhook payload
    attemptedAt:      { type: Date, default: Date.now },
  },
  { _id: true }
);

// ── Main Order schema ─────────────────────────────────────────────────────────
const OrderSchema = new Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    orderNumber: {
      type:   String,
      unique: true,
    },
    user: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    // ── Status machine ────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
      index:   true,
    },
    paymentStatus: {
      type:    String,
      enum:    ["unpaid", "paid", "partially_refunded", "refunded", "failed"],
      default: "unpaid",
      index:   true,
    },

    // ── Line items ────────────────────────────────────────────────────────────
    items: {
      type:     [OrderItemSchema],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message:   "Order must contain at least one item",
      },
    },

    // ── Financials ────────────────────────────────────────────────────────────
    subtotal:       { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0,     min: 0 },
    shippingAmount: { type: Number, default: 0,     min: 0 },
    taxAmount:      { type: Number, default: 0,     min: 0 },
    totalAmount:    { type: Number, required: true, min: 0 },
    currency:       { type: String, default: "GBP", maxlength: 3 },

    // ── Addresses ─────────────────────────────────────────────────────────────
    shippingAddress: { type: AddressSnapshotSchema },
    billingAddress:  { type: AddressSnapshotSchema },

    // ── Payments ──────────────────────────────────────────────────────────────
    payments: {
      type:    [PaymentSchema],
      default: [],
    },

    // ── Promotion ─────────────────────────────────────────────────────────────
    couponCode: { type: String },

    // ── Tracking ──────────────────────────────────────────────────────────────
    trackingNumber: { type: String },
    carrier:        { type: String },
    estimatedDeliveryAt: { type: Date },

    // ── Timestamps ────────────────────────────────────────────────────────────
    placedAt:    { type: Date },      // set when status → confirmed
    cancelledAt: { type: Date },
    deliveredAt: { type: Date },

    notes:    { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1,        createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });
OrderSchema.index({ "items.seller": 1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });

// ── Pre-save — auto-generate orderNumber ──────────────────────────────────────
OrderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const date    = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const count   = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart },
    });
    this.orderNumber = `ORD-${date}-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

// ── Pre-save — set placedAt on confirmation ────────────────────────────────────
OrderSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "confirmed" && !this.placedAt) {
    this.placedAt = new Date();
  }
  if (this.isModified("status") && this.status === "cancelled" && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  if (this.isModified("status") && this.status === "delivered" && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  next();
});

// ── Virtuals ──────────────────────────────────────────────────────────────────
OrderSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

OrderSchema.virtual("isCancellable").get(function () {
  return ["pending", "confirmed"].includes(this.status);
});

// ── Static helpers ────────────────────────────────────────────────────────────
/**
 * Returns paginated order history for a user.
 */
OrderSchema.statics.findByUser = function (userId, { page = 1, limit = 10 } = {}) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

/**
 * Returns all orders that contain at least one item from a given seller.
 */
OrderSchema.statics.findBySeller = function (sellerId, { page = 1, limit = 10 } = {}) {
  return this.find({ "items.seller": sellerId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

const Order = models.Order ?? model("Order", OrderSchema);
export default Order;
