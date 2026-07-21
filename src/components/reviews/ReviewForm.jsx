import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { LogIn } from "lucide-react";
import RatingStars from "../RatingStars";
import reviewService from "../../services/reviewService";
import { useAuth } from "../../context/AuthContext";

export default function ReviewForm({ productId, onSubmitted }) {
  const { isAuthenticated, isBuyer } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-ink-200 bg-cream-50 p-4 text-sm">
        <LogIn className="h-4 w-4 shrink-0 text-ink-400" />
        <p className="text-ink-600">
          <Link to="/login" className="font-semibold text-rust-500 hover:underline">
            Log in
          </Link>{" "}
          as a buyer to write a review for this item.
        </p>
      </div>
    );
  }

  if (!isBuyer) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-cream-50 p-4 text-sm text-ink-500">
        Only buyer accounts can review products.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a short comment");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await reviewService.addReview(productId, { rating, comment: comment.trim() });
      const newReview = data.review || data;
      onSubmitted(newReview);
      setRating(0);
      setComment("");
      toast.success("Review posted — thanks for sharing!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not post your review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-ink-100 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink-900">Write a review</h3>

      <div className="mb-3">
        <label className="label-field">Your rating</label>
        <RatingStars rating={rating} size="lg" interactive onChange={setRating} />
      </div>

      <div>
        <label className="label-field">Your review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was the fit, quality, and condition?"
          rows={3}
          className="input-field resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary mt-4 disabled:opacity-60"
      >
        {submitting ? "Posting..." : "Post review"}
      </button>
    </form>
  );
}
