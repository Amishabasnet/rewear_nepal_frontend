import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Loader2, Minus, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { formatNPR } from "../../utils/formatCurrency";
import { getImageUrl } from "../../utils/getImageUrl";
import { CONDITION_LABEL } from "../../utils/constants";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

function ItemThumb({ product }) {
  const [broken, setBroken] = useState(false);
  const src = getImageUrl(product?.images?.[0]);

  if (!src || broken) {
    return (
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-cream-200 text-ink-300">
        <ShoppingBag className="h-6 w-6" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      onError={() => setBroken(true)}
      className="h-20 w-20 shrink-0 rounded-xl object-cover"
    />
  );
}

export default function Cart() {
  const { items, loading, refreshCart, updateQuantity, removeItem } = useCart();
  const [busyId, setBusyId] = useState(null);

  // Re-fetch every time this screen is visited so it always shows the latest cart,
  // even if an item was added from another page during this session.
  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = items.reduce((sum, i) => sum + (i.quantity || 1) * (i.product?.price || 0), 0);

  const handleQuantityChange = async (productId, nextQty) => {
    if (nextQty < 1) return;
    setBusyId(productId);
    try {
      await updateQuantity(productId, nextQty);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update quantity");
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    try {
      await removeItem(productId);
      toast.success("Item removed from cart");
    } catch {
      // removeItem already surfaces its own error toast
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rust-500">Cart</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink-900">Your Cart</h1>
        {items.length > 0 && (
          <p className="mt-1 text-sm text-ink-500">
            {items.length} {items.length === 1 ? "piece" : "pieces"} waiting for a second story
          </p>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading cart..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Browse the shop and add pieces you love."
          action={
            <Link to="/products" className="mt-1 text-sm font-semibold text-rust-500 hover:underline">
              Start shopping
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const product = item.product || {};
            const productId = product._id || item.product;
            const isBusy = busyId === productId;
            const qty = item.quantity || 1;

            return (
              <div
                key={item._id || productId}
                className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4 transition hover:border-ink-200 hover:shadow-sm"
              >
                <ItemThumb product={product} />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink-900">{product.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-500">
                    {product.size && (
                      <span className="rounded-full bg-cream-200 px-2 py-0.5 font-medium">
                        Size {product.size}
                      </span>
                    )}
                    {product.condition && (
                      <span className="rounded-full bg-cream-200 px-2 py-0.5 font-medium">
                        {CONDITION_LABEL[product.condition] || product.condition}
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(productId, qty - 1)}
                      disabled={isBusy || qty <= 1}
                      aria-label="Decrease quantity"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition hover:border-ink-400 disabled:opacity-40"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-ink-800">{qty}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(productId, qty + 1)}
                      disabled={isBusy}
                      aria-label="Increase quantity"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition hover:border-ink-400 disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="rounded-md bg-mustard-100 px-2.5 py-1 text-sm font-bold text-ink-800">
                    {formatNPR(qty * (product.price || 0))}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(productId)}
                    disabled={isBusy}
                    aria-label="Remove item"
                    className="rounded-full p-1.5 text-ink-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  >
                    {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Order ticket — styled like a perforated garment tag */}
          <div className="relative mt-6 rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm text-ink-500">
              <span>Subtotal</span>
              <span className="font-medium text-ink-700">{formatNPR(subtotal)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm text-ink-500">
              <span>Shipping</span>
              <span className="font-medium text-ink-700">Calculated at checkout</span>
            </div>

            <div className="relative -mx-5 my-4">
              <div className="border-t-2 border-dashed border-ink-200" />
              <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-ink-100 bg-cream-50" />
              <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-ink-100 bg-cream-50" />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-ink-900">Total</span>
              <span className="font-display text-xl font-semibold text-forest-600">{formatNPR(subtotal)}</span>
            </div>

            <Link to="/checkout" className="btn-primary mt-5 block text-center">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
