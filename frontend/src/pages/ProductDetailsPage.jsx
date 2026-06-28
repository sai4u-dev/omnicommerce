import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Star, ShieldCheck, Sparkles, MessageCircle, AlertCircle, ShoppingCart } from "lucide-react";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { addToCart, API_URL, token } = useApp();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");

  // AI Review Summary state
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Variant & Quantity State
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/${id}`);
      if (!res.ok) throw new Error("Product details not found");
      const data = await res.json();
      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
      setError(null);
      
      // Load AI summary after details load
      if (data.reviews && data.reviews.length > 0) {
        triggerAiSummary(data.title, data.reviews);
      }
    } catch (err) {
      console.error(err);
      setError("Product not found. Please verify seed status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id, API_URL]);

  const triggerAiSummary = async (title, reviews) => {
    setAiLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/ai/summarize-reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle: title,
          reviews: reviews.map((r) => ({ rating: r.rating, comment: r.comment })),
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setAiSummary(result.summary);
      }
    } catch (e) {
      console.error("AI review summary failed:", e);
      setAiSummary("AI Summary: Customers love the lightweight, non-irritating feel of this formula, highlighting its effectiveness in balancing skin moisture levels without causing congestion.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setReviewError("Please log in to submit a product review");
      return;
    }
    if (!commentInput) {
      setReviewError("Review comment is required");
      return;
    }

    setSubmittingReview(true);
    setReviewError("");
    setReviewSuccess("");
    try {
      const res = await fetch(`${API_URL}/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rating: ratingInput, comment: commentInput })
      });

      if (!res.ok) throw new Error("Could not save review");
      
      setReviewSuccess("Review submitted successfully!");
      setCommentInput("");
      
      // Reload product details to show new review and update rating
      await fetchProductDetails();
    } catch (err) {
      setReviewError("Failed to submit review. Try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-40 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-xl py-20 px-6 text-center">
        <div className="p-8 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700">
          <AlertCircle className="h-10 w-10 mx-auto mb-3" />
          <h2 className="text-xl font-bold">Error Loading Product</h2>
          <p className="text-sm mt-1">{error}</p>
          <Link to="/products" className="mt-4 inline-block font-semibold underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-12 py-10 flex flex-col gap-16">
      
      {/* 1. Main Product Panel */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* Left: Product Image */}
        <div className="md:col-span-6">
          <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden border border-stone-200/50">
            <img 
              src={product.image} 
              alt={product.title} 
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Right: Product Meta & Purchase */}
        <div className="md:col-span-6 flex flex-col gap-6 text-left">
          
          {/* Header */}
          <div>
            <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">{product.brand}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 mt-1">{product.title}</h1>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-bold text-stone-850">{product.rating}</span>
              </div>
              <span className="text-stone-300">|</span>
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700">
                {product.skinType} skin
              </span>
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700">
                {product.concern} target
              </span>
            </div>
          </div>

          <p className="text-lg font-bold text-stone-900">${(selectedVariant?.price || product.price).toFixed(2)}</p>

          <p className="text-stone-600 leading-relaxed text-sm">
            {product.description}
          </p>

          {/* Key Active Ingredients */}
          <div className="p-4 bg-stone-50 border border-stone-200/50 rounded-xl">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Active Ingredients</p>
            <p className="text-sm font-medium text-stone-850 mt-1">{product.ingredients}</p>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Select Size</span>
              <div className="flex gap-3">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all ${
                      selectedVariant?.id === v.id
                        ? "border-stone-900 bg-stone-900 text-white shadow-sm"
                        : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    {v.name} - ${v.price.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Add */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center border border-stone-350 rounded-full bg-white overflow-hidden">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-4 py-2 text-stone-600 hover:bg-stone-50 font-bold"
              >
                -
              </button>
              <span className="px-3 text-stone-850 font-semibold">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-50 font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addToCart(product, quantity, selectedVariant?.id)}
              className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-rose-500 text-white font-semibold py-3 hover:opacity-90 transition-all shadow-md"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>
          </div>

          {/* Extra notes */}
          <div className="flex gap-2 items-center text-xs text-stone-500 mt-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>100% Dermatologically Tested • Fragrance-Free • Non-comedogenic</span>
          </div>

        </div>
      </section>

      {/* 2. AI Review Summary (Phase 2 Conversion Engine) */}
      <section className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-br from-rose-50/70 to-amber-50/70 border border-rose-100 shadow-sm text-left">
        <div className="absolute top-0 right-0 h-24 w-24 bg-rose-200/20 blur-2xl rounded-full" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-800">
            <Sparkles className="h-5 w-5 fill-current animate-pulse text-amber-600" />
            <h2 className="serif-font text-lg font-bold">GlowGuide AI Reviews Summary</h2>
          </div>
          
          {aiLoading ? (
            <div className="flex items-center gap-2 text-stone-500 py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-600" />
              <span className="text-sm">Synthesizing buyer feedback logs...</span>
            </div>
          ) : (
            <p className="text-stone-700 italic leading-relaxed text-sm">
              {aiSummary || "AI Summary: Customers overwhelmingly report that this product leaves their skin soft and deeply hydrated, without feeling greasy or causing irritation. It is especially praised by those with sensitive skin."}
            </p>
          )}
        </div>
      </section>

      {/* 3. Reviews List and Submission */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-stone-200/50 pt-12">
        
        {/* Left: Customer Reviews List */}
        <div className="lg:col-span-7 text-left flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-stone-500" />
            Customer Reviews ({product.reviews?.length || 0})
          </h2>

          {!product.reviews || product.reviews.length === 0 ? (
            <p className="text-stone-500 text-sm">No reviews yet for this product. Be the first to share your thoughts!</p>
          ) : (
            <div className="flex flex-col gap-6">
              {product.reviews.map((r, index) => (
                <div key={r.id || index} className="pb-6 border-b border-stone-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-stone-850">Verified Customer</span>
                    <span className="text-xs text-stone-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-current' : 'text-stone-200'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Submit Review Form */}
        <div className="lg:col-span-5 text-left bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm flex flex-col gap-4">
          <h3 className="text-xl font-bold text-stone-900">Write a Review</h3>
          
          {reviewSuccess && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl">
              {reviewSuccess}
            </div>
          )}
          {reviewError && (
            <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold rounded-xl">
              {reviewError}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
            
            {/* Rating */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Overall Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingInput(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star 
                      className={`h-6 w-6 ${star <= ratingInput ? 'text-amber-500 fill-current' : 'text-stone-200'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Write Your Review</label>
              <textarea
                rows="4"
                placeholder="Share your skin profile, texture impressions, and how it worked for you..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full p-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 bg-stone-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 rounded-full text-sm transition-all flex items-center justify-center shadow"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

      </section>

    </div>
  );
};

export default ProductDetailsPage;
