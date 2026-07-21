import { Trash2 } from "lucide-react";
import RatingStars from "../RatingStars";
import { formatDate } from "../../utils/formatDate";

export default function ReviewCard({ review, canDelete, onDelete, deleting }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-100 text-xs font-semibold text-forest-700">
            {review.buyer?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">{review.buyer?.name || "Buyer"}</p>
            <span className="text-xs text-ink-400">{formatDate(review.createdAt)}</span>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={() => onDelete(review._id || review.id)}
            disabled={deleting}
            aria-label="Delete review"
            className="rounded-lg p-1.5 text-ink-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <RatingStars rating={review.rating} showValue={false} />
      <p className="mt-2 text-sm leading-relaxed text-ink-600">{review.comment}</p>
    </div>
  );
}
