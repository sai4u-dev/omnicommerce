import { X } from "lucide-react";

export default function ActiveFilterChips({
  filters,
  onRemove,
  onClearAll,
  className = "",
}) {
  const entries = Object.entries(filters).flatMap(([section, values]) =>
    (values ?? []).map((v) => ({ section, value: v }))
  );

  if (entries.length === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {entries.map(({ section, value }) => (
        <button
          key={`${section}-${value}`}
          onClick={() => onRemove(section, value)}
          className="flex items-center gap-1 px-2.5 py-0.5 text-[9px]
                     tracking-wide border hover:bg-stone-100 transition-colors"
          style={{ borderColor: "#1a1a1a" }}
          aria-label={`Remove filter: ${value}`}
        >
          {value}
          <X size={8} />
        </button>
      ))}

      <button
        onClick={onClearAll}
        className="text-[9px] tracking-wide text-stone-400 underline
                   underline-offset-2 whitespace-nowrap px-1"
      >
        Clear all
      </button>
    </div>
  );
}
