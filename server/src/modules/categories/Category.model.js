// src/models/Category.model.js
import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const CategorySchema = new Schema(
  {
    parent: {
      type:    Schema.Types.ObjectId,
      ref:     "Category",
      default: null,
      index:   true,
    },
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    slug: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    description: { type: String },
    imageUrl:    { type: String },
    sortOrder:   { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true, index: true },

    // Materialised path for efficient tree queries  ("/outerwear/coats")
    path: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject:{ virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1, sortOrder: 1 });
CategorySchema.index({ path: 1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
CategorySchema.virtual("isRoot").get(function () {
  return this.parent == null;
});

// ── Static helpers ────────────────────────────────────────────────────────────

/** Returns the full category tree starting from root nodes */
CategorySchema.statics.getTree = function () {
  return this.find({ isActive: true }).sort("sortOrder").lean();
};

/** Returns a category and all its descendants via materialised path prefix */
CategorySchema.statics.getSubtree = async function (slug) {
  const root = await this.findOne({ slug, isActive: true }).lean();
  if (!root) return [];
  const prefix = root.path ? `${root.path}/${root._id}` : String(root._id);
  return this.find({
    $or: [{ _id: root._id }, { path: { $regex: `^${prefix}` } }],
    isActive: true,
  }).lean();
};

// ── Pre-save hook — maintain materialised path ────────────────────────────────
CategorySchema.pre("save", async function (next) {
  if (this.isModified("parent") || this.isNew) {
    if (!this.parent) {
      this.path = "";
    } else {
      const parentDoc = await this.constructor.findById(this.parent).lean();
      this.path = parentDoc
        ? `${parentDoc.path}/${parentDoc._id}`.replace(/^\//, "")
        : "";
    }
  }
  next();
});

const Category = models.Category ?? model("Category", CategorySchema);
export default Category;
