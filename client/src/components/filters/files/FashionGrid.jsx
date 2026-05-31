// src/pages/FashionGrid.jsx
import { useState, useEffect, useRef, useCallback } from "react";

import Navbar from "@/components/filters/files/Navbar";
import FilterPanel from "@/components/filters/files/FilterPanel";
import ActiveFilterChips from "@/components/filters/files/ActiveFilterChips";
import ProductGrid from "@/components/filters/files/ProductGrid";

import { generateProducts } from "./mockProducts";
import { PRICE_RANGE_DEFAULT } from "../../../utils/filterConfig";

const PER_PAGE = 12;
const MAX_PAGES = 5;

/**
 * Main product-listing page.
 * Owns all shared state and wires sub-components together.
 * In production, replace `generateProducts` calls with Redux thunk dispatches.
 */
export default function FashionGrid() {
  // ── Product / pagination state ────────────────────────────────────────────
  const [products, setProducts] = useState(() => generateProducts(0, PER_PAGE));
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ── Filter / sort state ───────────────────────────────────────────────────
  const [filters, setFilters] = useState({});
  const [priceRange, setPriceRange] = useState(PRICE_RANGE_DEFAULT);
  const [sort, setSort] = useState("Featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Infinite-scroll sentinel ref
  const loaderRef = useRef(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeFilterCount =
    Object.values(filters).reduce((a, v) => a + (v?.length ?? 0), 0) +
    (priceRange[0] > PRICE_RANGE_DEFAULT[0] || priceRange[1] < PRICE_RANGE_DEFAULT[1] ? 1 : 0);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const resetFilters = () => {
    setFilters({});
    setPriceRange(PRICE_RANGE_DEFAULT);
  };

  const removeFilter = (section, value) => {
    setFilters((prev) => ({
      ...prev,
      [section]: (prev[section] ?? []).filter((v) => v !== value),
    }));
  };

  // ── Infinite scroll ───────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);

    // Simulate network delay — replace with real API call / Redux thunk
    setTimeout(() => {
      const nextPage = page + 1;
      if (nextPage >= MAX_PAGES) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      setProducts((prev) => [...prev, ...generateProducts(nextPage, PER_PAGE)]);
      setPage(nextPage);
      setLoading(false);
    }, 900);
  }, [loading, hasMore, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "300px" }
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [loadMore]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ background: "#f9f6f1", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <Navbar
        sort={sort}
        onSortChange={setSort}
        filters={filters}
        setFilters={setFilters}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        activeFilterCount={activeFilterCount}
        onResetFilters={resetFilters}
        mobileFilterOpen={mobileFilterOpen}
        setMobileFilterOpen={setMobileFilterOpen}
      />

      {/* ── Mobile active filter chips strip ──────────────────────────────── */}
      {activeFilterCount > 0 && (
        <div
          className="flex md:hidden items-center gap-1.5 px-4 py-2 overflow-x-auto"
          style={{ borderBottom: "1px solid #e8e2d9" }}
        >
          <ActiveFilterChips
            filters={filters}
            onRemove={removeFilter}
            onClearAll={resetFilters}
          />
        </div>
      )}

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="flex">

        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex flex-col sticky top-14 h-[calc(100vh-3.5rem)]
                     overflow-y-auto px-6 pt-6 pb-8 shrink-0 border-r"
          style={{ width: "220px", background: "#f9f6f1", borderColor: "#e8e2d9" }}
        >
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            onReset={resetFilters}
            activeCount={activeFilterCount}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 md:px-6 lg:px-8 pt-5 pb-16">

          {/* Result count + desktop active chips */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] tracking-[0.15em] text-stone-400 uppercase">
              {products.length} pieces
            </p>
            <div className="hidden md:flex items-center gap-2">
              <ActiveFilterChips
                filters={filters}
                onRemove={removeFilter}
                onClearAll={resetFilters}
              />
            </div>
          </div>

          {/* Product grid */}
          <ProductGrid
            products={products}
            loading={loading}
            hasMore={hasMore}
            loaderRef={loaderRef}
          />
        </main>
      </div>
    </div>
  );
}
