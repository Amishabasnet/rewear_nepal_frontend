import RatingStars from "../RatingStars";
import ReviewCard from "./ReviewCard";

export default function ReviewList({ reviews, avgRating, canDelete, onDelete, deletingId }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold text-ink-900">Reviews ({reviews.length})</h2>
        {reviews.length > 0 && <RatingStars rating={avgRating} size="md" reviewCount={reviews.length} />}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-ink-500">No reviews yet for this item. Be the first to share your thoughts.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard
              key={review._id || review.id}
              review={review}
              canDelete={canDelete}
              onDelete={onDelete}
              deleting={deletingId === (review._id || review.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
