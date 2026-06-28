import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Search, SlidersHorizontal, ShoppingCart, Star } from "lucide-react";

const ProductPage = () => {
  const { addToCart, API_URL } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read filter values from URL params
  const currentSkinType = searchParams.get("skinType") || "all";
  const currentConcern = searchParams.get("concern") || "all";
  const currentSearch = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (currentSkinType !== "all") queryParams.append("skinType", currentSkinType);
        if (currentConcern !== "all") queryParams.append("concern", currentConcern);
        if (currentSearch) queryParams.append("search", currentSearch);

        const res = await fetch(`${API_URL}/products?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Could not load products catalog");
        const data = await res.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Products catalog loading error:", err);
        setError("Unable to load product list. Running backend and seed script will resolve this.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentSkinType, currentConcern, currentSearch, API_URL]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      if (searchInput) {
        prev.set("search", searchInput);
      } else {
        prev.delete("search");
      }
      return prev;
    });
  };

  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      if (value === "all") {
        prev.delete(key);
      } else {
        prev.set(key, value);
      }
      return prev;
    });
  };

  const skinTypesList = ["all", "dry", "oily", "sensitive", "combination"];
  const concernsList = ["all", "acne", "aging", "hydration", "brightening"];

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-10 flex flex-col gap-10">

      {/* Page Header */}
      <div className="text-left flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-extrabold text-stone-900">Curated Skincare Catalog</h1>
        <p className="text-stone-600">High-performance formulas clinically backed for results.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm">

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:max-w-md">
          <input
            type="text"
            placeholder="Search ingredients, products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border border-stone-300 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-stone-50/50"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
        </form>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-4 w-full lg:w-auto items-center">

          {/* Skin Type */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Skin Type:</span>
            <select
              value={currentSkinType}
              onChange={(e) => setFilter("skinType", e.target.value)}
              className="px-3.5 py-2.5 rounded-full border border-stone-300 text-sm font-medium text-stone-700 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-amber-600"
            >
              {skinTypesList.map((t) => (
                <option key={t} value={t}>{t === 'all' ? 'All Types' : t.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Skin Concern */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Target Concern:</span>
            <select
              value={currentConcern}
              onChange={(e) => setFilter("concern", e.target.value)}
              className="px-3.5 py-2.5 rounded-full border border-stone-300 text-sm font-medium text-stone-700 bg-stone-50 focus:outline-none focus:ring-1 focus:ring-amber-600"
            >
              {concernsList.map((c) => (
                <option key={c} value={c}>{c === 'all' ? 'All Concerns' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Catalog View */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
        </div>
      ) : error ? (
        <div className="py-16 text-center text-rose-600 bg-rose-50/50 rounded-2xl border border-rose-100 p-8 max-w-xl mx-auto">
          <p className="font-bold text-lg">Catalog Currently Unavailable</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-stone-500">
          <p className="text-xl font-bold">No products match your filters</p>
          <p className="text-sm mt-1">Try resetting filters or search parameters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col bg-white rounded-2xl border border-stone-200/50 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Product Thumbnail */}
              <Link to={`/products/${p.id}`} className="aspect-square bg-stone-100 overflow-hidden relative block">
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Floating Tags */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500 text-stone-950 shadow-sm">
                    {p.skinType === 'all' ? 'All Skin' : `${p.skinType} skin`}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-rose-500 text-white shadow-sm">
                    {p.concern}
                  </span>
                </div>
              </Link>

              {/* Product Info */}
              <div className="flex flex-col flex-1 p-5 text-left gap-2.5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">{p.brand}</p>
                    <Link to={`/products/${p.id}`} className="text-base font-bold text-stone-850 hover:text-amber-600 leading-snug line-clamp-1">
                      {p.title}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-xs font-bold text-stone-700">{p.rating}</span>
                </div>

                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>

                {/* Bottom line price and cart */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
                  <span className="text-lg font-extrabold text-stone-900">${p.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(p, 1, p.variants?.[0]?.id)}
                    className="p-2.5 rounded-full bg-stone-800 text-white hover:bg-amber-600 transition-colors shadow-sm"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ProductPage;
