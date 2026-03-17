// src/components/Navbar.jsx
import { Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SortDropdown from "./SortDropdown";
import FilterPanel from "./FilterPanel";

export default function Navbar({
  sort,
  onSortChange,
  filters,
  setFilters,
  priceRange,
  setPriceRange,
  activeFilterCount,
  onResetFilters,
  mobileFilterOpen,
  setMobileFilterOpen,
}) {
  const filterPanel = (
    <FilterPanel
      filters={filters}
      setFilters={setFilters}
      priceRange={priceRange}
      setPriceRange={setPriceRange}
      onReset={onResetFilters}
      activeCount={activeFilterCount}
    />
  );

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between
                 px-4 md:px-8 h-14 border-b"
      style={{ background: "#f9f6f1", borderColor: "#e8e2d9" }}
    >
      {/* Brand wordmark */}
      <span
        className="text-[22px] tracking-[0.28em] font-light select-none"
        style={{ fontFamily: "'Playfair Display', serif", color: "#1a1a1a" }}
      >
        MAISON
      </span>

      <div className="flex items-center gap-2">

        {/* ── Mobile controls ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 md:hidden">

          {/* Mobile filter sheet trigger */}
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <button
                className="relative flex items-center gap-1.5 px-3 h-8 text-[10px]
                           font-semibold tracking-[0.14em] uppercase border transition-colors"
                style={{
                  borderColor: activeFilterCount > 0 ? "#1a1a1a" : "#d6cfc4",
                  background: activeFilterCount > 0 ? "#1a1a1a" : "transparent",
                  color: activeFilterCount > 0 ? "#f9f6f1" : "#1a1a1a",
                }}
                aria-label="Open filters"
              >
                <Filter size={11} />
                Filter
                {activeFilterCount > 0 && (
                  <span
                    className="ml-0.5 text-[8px] font-bold px-1 py-0.5 rounded-full"
                    style={{ background: "#c9a96e", color: "#fff" }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[82vw] max-w-[340px] p-5 overflow-y-auto"
              style={{ background: "#f9f6f1", borderColor: "#e8e2d9" }}
            >
              <SheetHeader className="mb-4">
                <SheetTitle
                  className="text-left text-[10px] tracking-[0.22em] font-bold uppercase"
                  style={{ color: "#1a1a1a" }}
                >
                  Filters
                </SheetTitle>
              </SheetHeader>
              {filterPanel}
            </SheetContent>
          </Sheet>

          {/* Mobile sort */}
          <SortDropdown value={sort} onChange={onSortChange} compact />
        </div>

        {/* ── Desktop sort ─────────────────────────────────────────────────── */}
        <div className="hidden md:block">
          <SortDropdown value={sort} onChange={onSortChange} />
        </div>
      </div>
    </header>
  );
}
