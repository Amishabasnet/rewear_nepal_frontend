import { Link } from "react-router-dom";
import { formatNPR } from "../utils/formatCurrency";
import { getImageUrl } from "../utils/getImageUrl";

const CONDITION_LABELS = {
  new: "New",
  like_new: "Excellent",
  good: "Good",
  fair: "Fair",
};

export default function ProductCard({ product }) {
  const conditionLabel = CONDITION_LABELS[product.condition] || product.condition;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block overflow-hidden rounded-xl border border-ink-100 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream-200">
        <img
          src={getImageUrl(product.images?.[0])}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {conditionLabel && (
          <span
            className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
              product.condition === "fair"
                ? "bg-mustard-600 text-ink-800"
                : "bg-forest-600 text-cream-50"
            }`}
          >
            {conditionLabel}
          </span>
        )}
      </div>
      <div className="space-y-1 p-3">
        <p className="truncate text-sm font-semibold text-ink-900">{product.title}</p>
        <p className="truncate text-xs text-ink-400">{product.brand}</p>
        <p className="text-sm font-bold text-mustard-600">{formatNPR(product.price)}</p>
      </div>
    </Link>
  );
}
