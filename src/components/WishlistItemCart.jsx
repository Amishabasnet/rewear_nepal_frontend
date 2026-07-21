import { Link } from "react-router-dom";
import { ShoppingBag, Loader2, X } from "lucide-react";
import { formatNPR } from "../utils/formatCurrency";
import { CONDITION_LABEL } from "../utils/constants";

export default function WishlistItemCard({ product, onRemove, onMoveToCart, busy }) {
  const discount = product.originalPrice
    ? Math.round(100 - (product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-ink-100 bg-white transition hover:shadow-md">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-cream-200">
          <img
            src={product.images?.[0]}
            alt={product.title || product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          {discount > 0 && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-forest-600 px-2 py-1 text-xs font-bold text-cream-50">
              -{discount}%
            </span>
          )}
        </div>
      </Link>

      <button
        onClick={() => onRemove(product._id)}
        disabled={busy}
        aria-label="Remove from wishlist"
        className="absolute right-2.5 top-2.5 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur transition hover:scale-110 hover:bg-red-50 disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin text-ink-500" />
        ) : (
          <X className="h-4 w-4 text-ink-600" />
        )}
      </button>

      <div className="space-y-2 p-3.5">
        <Link to={`/products/${product._id}`} className="block">
          <p className="truncate text-sm font-semibold text-ink-900">{product.title || product.name}</p>
          <p className="truncate text-xs text-ink-400">{product.brand}</p>
        </Link>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-mustard-100 px-2 py-0.5 text-sm font-bold text-ink-800">
            {formatNPR(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-ink-400 line-through">{formatNPR(product.originalPrice)}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-500">
          {product.size && (
            <span className="rounded-full bg-cream-200 px-2 py-0.5 font-medium">Size {product.size}</span>
          )}
          {product.condition && (
            <span className="rounded-full bg-cream-200 px-2 py-0.5 font-medium">
              {CONDITION_LABEL[product.condition] || product.condition}
            </span>
          )}
        </div>

        <div className="pt-1">
          <button
            onClick={() => onMoveToCart(product._id)}
            disabled={busy}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-ink-900 py-2 text-xs font-semibold text-cream-50 transition hover:bg-ink-800 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShoppingBag className="h-3.5 w-3.5" />}
            Move to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
