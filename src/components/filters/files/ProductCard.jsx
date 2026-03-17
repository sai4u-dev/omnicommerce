// src/components/ProductCard.jsx
import { useState } from "react";
import { Heart } from "lucide-react";
import StarRating from "./StarRating";


export default function ProductCard({ product, onWishlist }) {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(product.isWishlisted);

  const handleWishlist = (e) => {
    e.stopPropagation();
    setWishlisted((w) => !w);
    onWishlist?.(product.id);
  };

  const discount =
    product.originalPrice
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="group relative flex flex-col cursor-pointer"
      aria-label={`${product.name} by ${product.brand}`}
    >
      {/* ── Image / Colour Placeholder ─────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "3/4",
          background: `linear-gradient(135deg, ${product.color} 0%, ${product.accentColor}44 100%)`,
        }}
      >
        {/* Subtle fabric texture overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.03) 2px,
              rgba(0,0,0,0.03) 4px
            )`,
          }}
        />

        {/* Brand monogram watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="text-6xl font-thin tracking-widest select-none"
            style={{
              color: product.accentColor,
              opacity: 0.3,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {product.brand[0]}
          </span>
        </div>

        {/* ── Badge ──────────────────────────────────────────────────────── */}
        {product.tag && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className="text-[9px] font-bold tracking-[0.18em] px-2 py-0.5"
              style={{
                background:
                  product.tag === "SALE" ? "#1a1a1a"
                    : product.tag === "SOLD OUT" ? "#6b7280"
                      : "#c9a96e",
                color: "#f5f0e8",
              }}
            >
              {product.tag}
            </span>
          </div>
        )}

        {/* ── Wishlist Button ─────────────────────────────────────────────── */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2.5 right-2.5 z-10 p-1.5 transition-all duration-200"
          style={{
            background: "rgba(245,240,232,0.85)",
            backdropFilter: "blur(4px)",
            opacity: hovered || wishlisted ? 1 : 0,
          }}
        >
          <Heart
            size={13}
            fill={wishlisted ? "#1a1a1a" : "none"}
            className="text-stone-800"
          />
        </button>

        {/* ── Quick-Add Size Bar ──────────────────────────────────────────── */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-2.5 transition-all duration-300"
          style={{
            background: "rgba(26,26,26,0.88)",
            backdropFilter: "blur(4px)",
            transform: hovered ? "translateY(0)" : "translateY(100%)",
          }}
        >
          <div className="flex gap-1.5">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                className="text-[9px] font-semibold tracking-[0.15em] px-2 py-1 border
                           transition-colors duration-150 hover:bg-stone-100 hover:text-stone-900"
                style={{ borderColor: "#c9a96e44", color: "#f5f0e8" }}
                aria-label={`Add size ${sz}`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product Info ───────────────────────────────────────────────────── */}
      <div className="pt-2.5 pb-1 flex flex-col gap-0.5">
        {/* Brand + Name */}
        <p
          className="text-[9px] tracking-[0.18em] font-semibold"
          style={{ color: "#a0856c" }}
        >
          {product.brand}
        </p>
        <p
          className="text-[12px] font-medium leading-snug mt-0.5 line-clamp-1"
          style={{ color: "#1a1a1a", fontFamily: "'Playfair Display', serif" }}
        >
          {product.name}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-1">
          <StarRating rating={product.rating} />
          <span className="text-[9px] text-stone-400">({product.reviewCount})</span>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[13px] font-semibold" style={{ color: "#1a1a1a" }}>
            £{product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[11px] text-stone-400 line-through">
              £{product.originalPrice}
            </span>
          )}
          {discount && (
            <span className="text-[9px] font-bold text-amber-700">
              {discount}% OFF
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
