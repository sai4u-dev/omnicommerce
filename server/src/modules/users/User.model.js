import mongoose from "mongoose";
const { Schema, model, models } = mongoose;
const AddressSchema = new Schema(
  {
    label: { type: String }, // "Home", "Office"
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, maxlength: 2 }, // ISO 3166-1 alpha-2
    phone: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: { createdAt: "createdAt", updatedAt: false } },
);

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false, // never returned in queries by default
    },
    /** Supabase / OAuth provider UID — present when auth is delegated */
    authProviderUid: {
      type: String,
      sparse: true,
      unique: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "apple", "supabase"],
      default: "local",
    },

    // ── RBAC role ──────────────────────────────────────────────────────────
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
      index: true,
    },

    // ── Profile ────────────────────────────────────────────────────────────
    fullName: { type: String, trim: true },
    avatarUrl: { type: String },
    phone: { type: String },
    dateOfBirth: { type: Date },

    // ── Addresses ─────────────────────────────────────────────────────────
    addresses: {
      type: [AddressSchema],
      default: [],
    },

    // ── Wishlist ──────────────────────────────────────────────────────────
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // ── Account status ────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true, index: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },

    // ── Password reset ────────────────────────────────────────────────────
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // ── Seller-specific fields (populated only when role === 'seller') ────
    sellerProfile: {
      storeName: { type: String },
      storeSlug: { type: String, sparse: true, unique: true },
      description: { type: String },
      logoUrl: { type: String },
      bankDetails: { type: Schema.Types.Mixed, select: false }, // encrypted at rest
    },

    // ── Metadata ─────────────────────────────────────────────────────────
    lastLoginAt: { type: Date },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Virtuals ──────────────────────────────────────────────────────────────────

UserSchema.virtual("isSeller").get(function () {
  return this.role === "seller";
});

UserSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});

UserSchema.virtual("defaultAddress").get(function () {
  return this.addresses.find((a) => a.isDefault) ?? this.addresses[0] ?? null;
});

// ── Indexes ───────────────────────────────────────────────────────────────────

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ "sellerProfile.storeSlug": 1 }, { sparse: true });

// ── Instance methods ──────────────────────────────────────────────────────────

/** Adds a product ObjectId to the wishlist (idempotent) */
UserSchema.methods.addToWishlist = function (productId) {
  if (!this.wishlist.some((id) => id.equals(productId))) {
    this.wishlist.push(productId);
  }
  return this.save();
};

/** Removes a product ObjectId from the wishlist */
UserSchema.methods.removeFromWishlist = function (productId) {
  this.wishlist = this.wishlist.filter((id) => !id.equals(productId));
  return this.save();
};

/** Sets a single address as default and unsets all others */
UserSchema.methods.setDefaultAddress = function (addressId) {
  this.addresses.forEach((addr) => {
    addr.isDefault = addr._id.equals(addressId);
  });
  return this.save();
};

// ── Model export ──────────────────────────────────────────────────────────────

const User = models.User ?? model("User", UserSchema);
export default User;
