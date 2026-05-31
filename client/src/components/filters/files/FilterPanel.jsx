// src/components/FilterPanel.jsx
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  FILTER_SECTIONS,
  PRICE_RANGE_DEFAULT,
  PRICE_RANGE_MIN,
  PRICE_RANGE_MAX,
  PRICE_RANGE_STEP,
} from "../../../utils/filterConfig";

/**
 * Sidebar / sheet filter panel.
 * Handles category checkboxes, size checkboxes, colour swatches, and a price slider.
 *
 * @param {{
 *   filters:        Record<string, string[]>,
 *   setFilters:     React.Dispatch,
 *   priceRange:     [number, number],
 *   setPriceRange:  React.Dispatch,
 *   onReset:        () => void,
 *   activeCount:    number,
 * }} props
 */
export default function FilterPanel({
  filters,
  setFilters,
  priceRange,
  setPriceRange,
  onReset,
  activeCount,
}) {
  const [openSections, setOpenSections] = useState(
    Object.fromEntries(FILTER_SECTIONS.map((s) => [s.id, true]))
  );

  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleFilter = (section, value) => {
    setFilters((prev) => {
      const current = prev[section] ?? [];
      return {
        ...prev,
        [section]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  return (
    <div
      className="w-full h-full overflow-y-auto"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 mb-1">
        <span
          className="text-[10px] font-bold tracking-[0.22em] uppercase"
          style={{ color: "#1a1a1a" }}
        >
          Refine
        </span>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-[9px] tracking-widest underline underline-offset-2
                       text-stone-400 hover:text-stone-700 transition-colors"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <Separator className="mb-4" style={{ background: "#e8e2d9" }} />

      {/* ── Price Range ─────────────────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-600">
            Price
          </span>
          <span className="text-[10px] text-stone-500">
            £{priceRange[0]} – £{priceRange[1]}
          </span>
        </div>
        <Slider
          min={PRICE_RANGE_MIN}
          max={PRICE_RANGE_MAX}
          step={PRICE_RANGE_STEP}
          value={priceRange}
          onValueChange={setPriceRange}
          className="w-full"
        />
      </div>

      <Separator className="mb-4" style={{ background: "#e8e2d9" }} />

      {/* ── Filter Sections ─────────────────────────────────────────────────── */}
      {FILTER_SECTIONS.map((section, idx) => {
        const IconComponent = section.icon;
        const selectedCount = filters[section.id]?.length ?? 0;

        return (
          <div key={section.id} className="mb-1">
            {/* Section toggle header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="flex items-center justify-between w-full py-2.5 group"
              aria-expanded={openSections[section.id]}
            >
              <div className="flex items-center gap-1.5 text-stone-600">
                <IconComponent size={13} />
                <span className="text-[10px] font-semibold tracking-[0.15em] uppercase">
                  {section.label}
                </span>
                {selectedCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-[8px] px-1.5 h-4 rounded-none"
                    style={{ background: "#c9a96e", color: "#fff" }}
                  >
                    {selectedCount}
                  </Badge>
                )}
              </div>
              <ChevronDown
                size={12}
                className="text-stone-400 transition-transform duration-200"
                style={{
                  transform: openSections[section.id]
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              />
            </button>

            {/* Section options */}
            {openSections[section.id] && (
              <div className="pb-3 pl-0.5">
                {section.isColor ? (
                  /* Colour swatches */
                  <div className="flex flex-wrap gap-2 mt-1">
                    {section.options.map((opt) => {
                      const selected = filters[section.id]?.includes(opt.label);
                      return (
                        <button
                          key={opt.label}
                          onClick={() => toggleFilter(section.id, opt.label)}
                          title={opt.label}
                          aria-pressed={selected}
                          className="relative flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-7 h-7 transition-all duration-150"
                            style={{
                              background: opt.hex,
                              outline: selected
                                ? "2px solid #1a1a1a"
                                : "2px solid transparent",
                              outlineOffset: "2px",
                            }}
                          />
                          <span className="text-[8px] tracking-wide text-stone-400">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Checkbox options */
                  <div className="flex flex-col gap-1.5 mt-1">
                    {section.options.map((opt) => {
                      const checked = filters[section.id]?.includes(opt) ?? false;
                      return (
                        <label
                          key={opt}
                          className="flex items-center gap-2 cursor-pointer group/item"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleFilter(section.id, opt)}
                            className="rounded-none w-3.5 h-3.5 border-stone-300
                                       data-[state=checked]:bg-stone-800
                                       data-[state=checked]:border-stone-800"
                          />
                          <span
                            className="text-[11px] tracking-wide transition-colors"
                            style={{ color: checked ? "#1a1a1a" : "#6b7280" }}
                          >
                            {opt}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {idx < FILTER_SECTIONS.length - 1 && (
              <Separator className="mb-1" style={{ background: "#e8e2d9" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
