import { useState } from "react";
import { Star } from "lucide-react";

export default function RatingStars({
  rating = 0,
  size = "sm",
  showValue = true,
  reviewCount,
  interactive = false,
  onChange,
}) {
  const sizes = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-7 w-7" };
  const [hovered, setHovered] = useState(0);
  const displayRating = interactive && hovered ? hovered : rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center" onMouseLeave={() => interactive && setHovered(0)}>
        {[1, 2, 3, 4, 5].map((star) =>
          interactive ? (
            <button
              key={star}
              type="button"
              onClick={() => onChange?.(star)}
              onMouseEnter={() => setHovered(star)}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              className="p-0.5 transition hover:scale-110"
            >
              <Star
                className={`${sizes[size]} ${
                  star <= displayRating ? "fill-mustard-400 text-mustard-400" : "fill-ink-100 text-ink-100"
                }`}
              />
            </button>
          ) : (
            <Star
              key={star}
              className={`${sizes[size]} ${
                star <= Math.round(displayRating) ? "fill-mustard-400 text-mustard-400" : "fill-ink-100 text-ink-100"
              }`}
            />
          )
        )}
      </div>
      {showValue && !interactive && (
        <span className="text-xs font-medium text-ink-500">
          {rating.toFixed(1)}
          {reviewCount !== undefined && ` (${reviewCount})`}
        </span>
      )}
    </div>
  );
}
