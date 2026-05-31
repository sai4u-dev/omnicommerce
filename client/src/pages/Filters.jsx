import { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    SlidersHorizontal,
    Star,
    Heart,
    ChevronDown,
    X,
    Sparkles,
    Tag,
    Palette,
    Ruler,
    Filter,
    ArrowUpDown,
} from "lucide-react";

const COLORS = ["#1a1a1a", "#c9a96e", "#8b7355", "#d4b896", "#f5f0e8", "#a0856c"];
const TAGS = ["NEW", "SALE", "SOLD OUT", "LIMITED", "EXCLUSIVE"];

const generateProducts = (page, perPage = 12) => {
    const names = [
        "Oversized Wool Coat", "Silk Slip Dress", "Tailored Blazer", "Cashmere Turtleneck",
        "Wide Leg Trousers", "Linen Shirt Dress", "Leather Moto Jacket", "Ribbed Midi Skirt",
        "Cropped Cardigan", "Wrap Maxi Dress", "Denim Jacket", "Satin Blouse",
        "Knit Co-ord Set", "Pleated Culottes", "Shearling Vest", "Broderie Dress",
        "Trench Coat", "Jersey Maxi Skirt", "Cutout Bodysuit", "Velvet Blazer",
        "Cargo Trousers", "Smocked Top", "Faux Fur Coat", "Slip Skirt",
    ];
    const brands = ["MAISON", "ATELIER", "STUDIO", "HAUS", "NOIR", "BLANC"];
    const prices = [89, 129, 189, 245, 320, 420, 550, 680, 790, 890, 1100, 1450];
    return Array.from({ length: perPage }, (_, i) => {
        const id = page * perPage + i;
        const hue = (id * 47) % 360;
        const sat = 10 + (id % 3) * 8;
        const lum = 78 + (id % 4) * 4;
        return {
            id,
            name: names[id % names.length],
            brand: brands[id % brands.length],
            price: prices[id % prices.length],
            originalPrice: Math.random() > 0.7 ? prices[(id + 3) % prices.length] : null,
            color: `hsl(${hue},${sat}%,${lum}%)`,
            accentColor: `hsl(${hue},${sat + 10}%,${lum - 20}%)`,
            rating: 3.5 + (id % 5) * 0.3,
            reviews: 12 + (id * 7) % 340,
            tag: Math.random() > 0.65 ? TAGS[id % TAGS.length] : null,
            isWishlisted: false,
            category: ["Outerwear", "Dresses", "Tops", "Bottoms", "Sets"][id % 5],
            sizes: ["XS", "S", "M", "L", "XL"].slice(id % 3, (id % 3) + 3 + (id % 2)),
        };
    });
};

// ─── Filter Config ────────────────────────────────────────────────────────────
const FILTER_SECTIONS = [
    {
        id: "category",
        icon: <Tag size={13} />,
        label: "Category",
        options: ["Outerwear", "Dresses", "Tops", "Bottoms", "Sets"],
    },
    {
        id: "size",
        icon: <Ruler size={13} />,
        label: "Size",
        options: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    {
        id: "color",
        icon: <Palette size={13} />,
        label: "Colour",
        isColor: true,
        options: [
            { label: "Noir", hex: "#1a1a1a" },
            { label: "Ivory", hex: "#f5f0e8" },
            { label: "Camel", hex: "#c9a96e" },
            { label: "Taupe", hex: "#8b7355" },
            { label: "Blush", hex: "#e8cfc0" },
            { label: "Slate", hex: "#6b7280" },
        ],
    },
];

const SORT_OPTIONS = ["Featured", "Newest", "Price: Low–High", "Price: High–Low", "Best Rated"];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StarRating({ rating }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={9}
                    fill={s <= Math.round(rating) ? "currentColor" : "none"}
                    className={s <= Math.round(rating) ? "text-amber-600" : "text-stone-300"}
                />
            ))}
        </div>
    );
}

function ProductCard({ product, onWishlist }) {
    const [hovered, setHovered] = useState(false);
    const [wishlisted, setWishlisted] = useState(product.isWishlisted);

    const toggleWishlist = (e) => {
        e.stopPropagation();
        setWishlisted((w) => !w);
        onWishlist?.(product.id);
    };

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            className="group relative flex flex-col cursor-pointer"
        >
            {/* Image Area */}
            <div
                className="relative overflow-hidden"
                style={{
                    aspectRatio: "3/4",
                    background: `linear-gradient(135deg, ${product.color} 0%, ${product.accentColor}44 100%)`,
                }}
            >
                {/* Faux product texture */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)`,
                    }}
                />

                <img className="" src="https://imgs.search.brave.com/vayiu9PO2-B-5xS1uUuV8O_QnV99koQqRRNYyAAmjEE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMjIv/MjQ4LzUzMy9zbWFs/bC9wb3J0cmFpdC1v/Zi1hLXdvbWFuLWlu/LWZhc2hpb25hYmxl/LWNsb3RoZXMtb24t/YS1saWdodC1iYWNr/Z3JvdW5kLWFuZC1h/LWZhbGxpbmctc2hh/ZG93LXBob3RvLmpw/Zw" alt="" />

                {/* Center monogram */}
                <div className="absolute inset-0 flex items-center justify-center">
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

                {/* Tag */}
                {product.tag && (
                    <div className="absolute top-2.5 left-2.5 z-10">
                        <span
                            className="text-[9px] font-bold tracking-[0.18em] px-2 py-0.5 "
                            style={{
                                background: product.tag === "SALE" ? "#1a1a1a" : product.tag === "SOLD OUT" ? "#6b7280" : "#c9a96e",
                                color: "#f5f0e8",
                            }}
                        >
                            {product.tag}
                        </span>
                    </div>
                )}

                {/* Wishlist */}
                <button
                    onClick={toggleWishlist}
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

                {/* Quick Add overlayt */}
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
                                className="text-[9px] font-semibold tracking-[0.15em] px-2 py-1 border transition-colors duration-150 hover:bg-stone-100 hover:text-stone-900"
                                style={{ borderColor: "#c9a96e44", color: "#f5f0e8" }}
                            >
                                {sz}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="pt-2.5 pb-1 flex flex-col gap-0.5">
                <div className="flex items-start justify-between gap-1">
                    <div>
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
                    </div>
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                    <StarRating rating={product.rating} />
                    <span className="text-[9px] text-stone-400">({product.reviews})</span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[13px] font-semibold" style={{ color: "#1a1a1a" }}>
                        £{product.price}
                    </span>
                    {product.originalPrice && (
                        <span className="text-[11px] text-stone-400 line-through">
                            £{product.originalPrice}
                        </span>
                    )}
                    {product.originalPrice && (
                        <span className="text-[9px] font-bold text-amber-700">
                            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function FilterPanel({ filters, setFilters, priceRange, setPriceRange, onReset, activeCount }) {
    const [openSections, setOpenSections] = useState({ category: true, size: true, color: true });

    const toggleSection = (id) =>
        setOpenSections((s) => ({ ...s, [id]: !s[id] }));

    const toggleFilter = (section, value) => {
        setFilters((prev) => {
            const current = prev[section] || [];
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
            {/* Header */}
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
                        className="text-[9px] tracking-widest underline underline-offset-2 text-stone-400 hover:text-stone-700 transition-colors"
                    >
                        Clear all ({activeCount})
                    </button>
                )}
            </div>

            <Separator className="mb-4" style={{ background: "#e8e2d9" }} />

            {/* Price Range */}
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
                    min={0}
                    max={2000}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="w-full"
                />
            </div>

            <Separator className="mb-4" style={{ background: "#e8e2d9" }} />

            {/* Filter Sections */}
            {FILTER_SECTIONS.map((section, idx) => (
                <div key={section.id} className="mb-1">
                    <button
                        onClick={() => toggleSection(section.id)}
                        className="flex items-center justify-between w-full py-2.5 group"
                    >
                        <div className="flex items-center gap-1.5 text-stone-600">
                            {section.icon}
                            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase">
                                {section.label}
                            </span>
                            {filters[section.id]?.length > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="text-[8px] px-1.5 h-4 rounded-none"
                                    style={{ background: "#c9a96e", color: "#fff" }}
                                >
                                    {filters[section.id].length}
                                </Badge>
                            )}
                        </div>
                        <ChevronDown
                            size={12}
                            className="text-stone-400 transition-transform duration-200"
                            style={{ transform: openSections[section.id] ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                    </button>

                    {openSections[section.id] && (
                        <div className="pb-3 pl-0.5">
                            {section.isColor ? (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {section.options.map((opt) => {
                                        const selected = filters[section.id]?.includes(opt.label);
                                        return (
                                            <button
                                                key={opt.label}
                                                onClick={() => toggleFilter(section.id, opt.label)}
                                                title={opt.label}
                                                className="relative flex flex-col items-center gap-1"
                                            >
                                                <div
                                                    className="w-7 h-7 transition-all duration-150"
                                                    style={{
                                                        background: opt.hex,
                                                        outline: selected ? `2px solid #1a1a1a` : "2px solid transparent",
                                                        outlineOffset: "2px",
                                                    }}
                                                />
                                                <span className="text-[8px] tracking-wide text-stone-400">{opt.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
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
                                                    className="rounded-none w-3.5 h-3.5 border-stone-300 data-[state=checked]:bg-stone-800 data-[state=checked]:border-stone-800"
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
            ))}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FashionGrid() {
    const [products, setProducts] = useState(() => generateProducts(0));
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({});
    const [priceRange, setPriceRange] = useState([0, 2000]);
    const [sort, setSort] = useState("Featured");
    const [sortOpen, setSortOpen] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const loaderRef = useRef(null);


    const activeFilterCount =
        Object.values(filters).reduce((a, v) => a + (v?.length || 0), 0) +
        (priceRange[0] > 0 || priceRange[1] < 2000 ? 1 : 0);

    const resetFilters = () => {
        setFilters({});
        setPriceRange([0, 2000]);
    };

    // Infinite scroll observer
    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        setLoading(true);
        setTimeout(() => {
            const nextPage = page + 1;
            if (nextPage >= 5) {
                setHasMore(false);
                setLoading(false);
                return;
            }

            setProducts((prev) => [...prev, ...generateProducts(nextPage)]);
            setPage(nextPage);
            setLoading(false);
        }, 200);
    }, [loading, hasMore, page]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) loadMore(); },
            { rootMargin: "300px" }
        );
        const el = loaderRef.current;
        if (el) observer.observe(el);
        return () => { if (el) observer.unobserve(el); };
    }, [loadMore]);

    const filterPanelContent = (
        <FilterPanel
            filters={filters}
            setFilters={setFilters}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            onReset={resetFilters}
            activeCount={activeFilterCount}
        />
    );

    return (
        <div
            className="min-h-screen"
            style={{
                background: "#f9f6f1",
                fontFamily: "'DM Sans', sans-serif",
            }}
        >


            {/* ── Top Nav Bar ── */}
            <header
                className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 h-14 border-b"
                style={{ background: "#f9f6f1", borderColor: "#e8e2d9" }}
            >
                <span
                    className="text-[22px] tracking-[0.28em] font-light select-none"
                    style={{ fontFamily: "'Playfair Display', serif", color: "#1a1a1a" }}
                >
                    MAISON
                </span>

                <div className="flex items-center gap-2">
                    {/* Mobile filter icons — fixed-style row */}
                    <div className="flex items-center gap-1 md:hidden">
                        {/* Filter icon */}
                        <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                            <SheetTrigger asChild>
                                <button
                                    className="relative flex items-center gap-1.5 px-3 h-8 text-[10px] font-semibold tracking-[0.14em] uppercase border transition-colors"
                                    style={{
                                        borderColor: activeFilterCount > 0 ? "#1a1a1a" : "#d6cfc4",
                                        background: activeFilterCount > 0 ? "#1a1a1a" : "transparent",
                                        color: activeFilterCount > 0 ? "#f9f6f1" : "#1a1a1a",
                                    }}
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
                                {filterPanelContent}
                            </SheetContent>
                        </Sheet>

                        {/* Sort icon */}
                        <div className="relative">
                            <button
                                onClick={() => setSortOpen((o) => !o)}
                                className="flex items-center gap-1.5 px-3 h-8 text-[10px] font-semibold tracking-[0.14em] uppercase border transition-colors"
                                style={{ borderColor: "#d6cfc4", color: "#1a1a1a" }}
                            >
                                <ArrowUpDown size={11} />
                                Sort
                            </button>
                            {sortOpen && (
                                <div
                                    className="absolute right-0 top-9 z-50 w-44 py-1 shadow-lg"
                                    style={{ background: "#f9f6f1", border: "1px solid #e8e2d9" }}
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => { setSort(opt); setSortOpen(false); }}
                                            className="w-full text-left px-4 py-2 text-[11px] tracking-wide hover:bg-stone-100 transition-colors"
                                            style={{ color: sort === opt ? "#1a1a1a" : "#78716c", fontWeight: sort === opt ? 600 : 400 }}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop sort */}
                    <div className="relative hidden md:block">
                        <button
                            onClick={() => setSortOpen((o) => !o)}
                            className="flex items-center gap-1.5 px-4 h-8 text-[10px] font-semibold tracking-[0.14em] uppercase border transition-colors hover:border-stone-400"
                            style={{ borderColor: "#d6cfc4", color: "#1a1a1a" }}
                        >
                            <ArrowUpDown size={11} />
                            {sort}
                            <ChevronDown size={11} />
                        </button>
                        {sortOpen && (
                            <div
                                className="absolute right-0 top-9 z-50 w-48 py-1 shadow-lg"
                                style={{ background: "#f9f6f1", border: "1px solid #e8e2d9" }}
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => { setSort(opt); setSortOpen(false); }}
                                        className="w-full text-left px-4 py-2 text-[11px] tracking-wide hover:bg-stone-100 transition-colors"
                                        style={{ color: sort === opt ? "#1a1a1a" : "#78716c", fontWeight: sort === opt ? 600 : 400 }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Active Filter Chips (mobile) ── */}
            {activeFilterCount > 0 && (
                <div className="flex md:hidden items-center gap-1.5 px-4 py-2 overflow-x-auto" style={{ borderBottom: "1px solid #e8e2d9" }}>
                    {Object.entries(filters).flatMap(([section, values]) =>
                        (values || []).map((v) => (
                            <button
                                key={`${section}-${v}`}
                                onClick={() =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        [section]: prev[section].filter((x) => x !== v),
                                    }))
                                }
                                className="flex items-center gap-1 px-2.5 py-1 text-[9px] tracking-wide whitespace-nowrap border"
                                style={{ borderColor: "#1a1a1a", background: "#1a1a1a", color: "#f9f6f1" }}
                            >
                                {v}
                                <X size={8} />
                            </button>
                        ))
                    )}
                    <button
                        onClick={resetFilters}
                        className="text-[9px] tracking-wide text-stone-400 underline underline-offset-2 whitespace-nowrap px-1"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* ── Main Layout ── */}
            <div className="flex">
                {/* ─ Desktop Sidebar Filter ─ */}
                <aside
                    className="hidden md:flex flex-col sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-6 pt-6 pb-8 shrink-0 border-r"
                    style={{ width: "220px", background: "#f9f6f1", borderColor: "#e8e2d9" }}
                >
                    {filterPanelContent}
                </aside>

                {/* ─ Product Grid ─ */}
                <main className="flex-1 px-4 md:px-6 lg:px-8 pt-5 pb-16">
                    {/* Result count */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] tracking-[0.15em] text-stone-400 uppercase">
                            {products.length} pieces
                        </p>
                        <div className="hidden md:flex items-center gap-2">
                            {activeFilterCount > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {Object.entries(filters).flatMap(([section, values]) =>
                                        (values || []).map((v) => (
                                            <button
                                                key={`${section}-${v}`}
                                                onClick={() =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        [section]: prev[section].filter((x) => x !== v),
                                                    }))
                                                }
                                                className="flex items-center gap-1 px-2.5 py-0.5 text-[9px] tracking-wide border hover:bg-stone-100 transition-colors"
                                                style={{ borderColor: "#1a1a1a" }}
                                            >
                                                {v} <X size={8} />
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Grid */}
                    <style>{`
            .fashion-grid { display: grid; gap: 1rem 1rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
            @media (min-width: 640px) { .fashion-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); row-gap: 2rem; } }
            @media (min-width: 1024px) { .fashion-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); row-gap: 2.5rem; } }
          `}</style>
                    <div className="fashion-grid">
                        {products.map((product, i) => (
                            <div
                                key={product.id}
                                className="product-card"
                                style={{ animationDelay: `${(i % 6) * 55}ms` }}
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}

                        {/* Skeleton loaders */}
                        {loading &&
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={`sk-${i}`} className="flex flex-col gap-2">
                                    <div
                                        className="shimmer w-full"
                                        style={{ aspectRatio: "3/4", borderRadius: 0 }}
                                    />
                                    <div className="shimmer h-2.5 w-2/3 rounded-sm" />
                                    <div className="shimmer h-3 w-3/4 rounded-sm" />
                                    <div className="shimmer h-3 w-1/3 rounded-sm" />
                                </div>
                            ))}
                    </div>

                    {/* Infinite scroll trigger */}
                    <div ref={loaderRef} className="h-8 mt-4" />

                    {/* End of results */}
                    {!hasMore && (
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
                </main>
            </div>
        </div>
    );
}