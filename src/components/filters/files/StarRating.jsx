import { Star } from "lucide-react";

export default function StarRating({ rating }) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={9}
          fill={star <= rounded ? "currentColor" : "none"}
          className={star <= rounded ? "text-amber-600" : "text-stone-300"}
        />
      ))}
    </div>
  );
}
