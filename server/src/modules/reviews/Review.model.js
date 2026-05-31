// src/models/Review.model.js
import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const ReviewSchema = new Schema(
  {
    product: {
      type:     Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
      index:    true,
    },
    user: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },
    /** Non-null = verified purchase */
    order: {
      type:    Schema.Types.ObjectId,
      ref:     "Order",
      default: null,
    },

    // ── Content ───────────────────────────────────────────────────────────
    rating: {
      type:     Number,
      required: true,
      min:      1,
      max:      5,
    },
    title:  { type: String, trim: true },
    body:   { type: String, trim: true },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
      },
    ],

    // ── Moderation ────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["pending", "approved", "rejected"],
      default: "pending",
      index:   true,
    },

    // ── Social ────────────────────────────────────────────────────────────
    helpfulCount: { type: Number, default: 0, min: 0 },
    helpfulVotes: [
      {
        type: Schema.Types.ObjectId,
        ref:  "User",
      },
    ],
  },
  { timestamps: true }
);

// ── One review per user per product ──────────────────────────────────────────
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.index({ status: 1, createdAt: -1 });

// ── Post-save: update denormalised rating on Product ─────────────────────────
ReviewSchema.post("save", async function () {
  if (this.status !== "approved") return;

  const Product = mongoose.model("Product");
  const stats   = await mongoose.model("Review").aggregate([
    { $match: { product: this.product, status: "approved" } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      "rating.average": parseFloat(stats[0].avg.toFixed(1)),
      "rating.count":   stats[0].count,
    });
  }
});

// ── Post-remove: recalculate rating ──────────────────────────────────────────
ReviewSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  const Product = mongoose.model("Product");
  const stats   = await mongoose.model("Review").aggregate([
    { $match: { product: doc.product, status: "approved" } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(doc.product, {
    "rating.average": stats[0]?.avg ?? 0,
    "rating.count":   stats[0]?.count ?? 0,
  });
});

const Review = models.Review ?? model("Review", ReviewSchema);
export default Review;
