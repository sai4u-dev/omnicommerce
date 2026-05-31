import { useState } from "react";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { SORT_OPTIONS } from "../../../utils/filterConfig";

export default function SortDropdown({ value, onChange, compact = false }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 h-8 text-[10px] font-semibold
                   tracking-[0.14em] uppercase border transition-colors hover:border-stone-400"
        style={{ borderColor: "#d6cfc4", color: "#1a1a1a" }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ArrowUpDown size={11} />
        {compact ? "Sort" : value}
        {!compact && <ChevronDown size={11} />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute right-0 top-9 z-50 w-48 py-1 shadow-lg"
            style={{ background: "#f9f6f1", border: "1px solid #e8e2d9" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <li key={opt} role="option" aria-selected={value === opt}>
                <button
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className="w-full text-left px-4 py-2 text-[11px] tracking-wide
                             hover:bg-stone-100 transition-colors"
                  style={{
                    color: value === opt ? "#1a1a1a" : "#78716c",
                    fontWeight: value === opt ? 600 : 400,
                  }}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
