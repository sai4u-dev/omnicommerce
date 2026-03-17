import { Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";

function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="shimmer w-full" style={{ aspectRatio: "3/4", borderRadius: 0 }} />
      <div className="shimmer h-2.5 w-2/3 rounded-sm" />
      <div className="shimmer h-3   w-3/4 rounded-sm" />
      <div className="shimmer h-3   w-1/3 rounded-sm" />
    </div>
  );
}

export default function ProductGrid({
  products,
  loading,
  hasMore,
  loaderRef,
  onWishlist,
}) {
  return (
    <section aria-label="Product listing">
      {/* Responsive grid — 2 / 4 / 6 columns */}
      <style>{`
        .fashion-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        @media (min-width: 640px) {
          .fashion-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            row-gap: 2rem;
          }
        }
        @media (min-width: 1024px) {
          .fashion-grid {
            grid-template-columns: repeat(6, minmax(0, 1fr));
            row-gap: 2.5rem;
          }
        }
      `}</style>

      <div className="fashion-grid">
        {products.map((product, i) => (
          <div
            key={product.id}
            style={{ animationDelay: `${(i % 6) * 55}ms` }}
          >
            <ProductCard product={product} onWishlist={onWishlist} />
          </div>
        ))}

        {/* Skeleton loaders while next page fetches */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <ProductSkeleton key={`sk-${i}`} />
          ))}
      </div>

      {/* Infinite-scroll sentinel */}
      <div ref={loaderRef} className="h-8 mt-4" aria-hidden="true" />

      {/* End of collection indicator */}
      {!hasMore && !loading && (
        <div className="text-center py-10">
          <div className="flex items-center gap-4 justify-center mb-3">
            <div className="h-px w-16" style={{ background: "#c9a96e55" }} />
            <Sparkles size={14} style={{ color: "#c9a96e" }} />
            <div className="h-px w-16" style={{ background: "#c9a96e55" }} />
          </div>
          <p className="text-[10px] tracking-[0.22em] text-stone-400 uppercase">
            End of Collection
          </p>
        </div>
      )}
    </section>
  );
}
