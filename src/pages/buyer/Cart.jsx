import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import cartService from "../../services/cartService";
import { formatNPR } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cartService
      .getCart()
      .then(({ data }) => setCart(data || { items: [] }))
      .catch(() => setCart({ items: [] }))
      .finally(() => setLoading(false));
  }, []);

  const items = cart.items || [];
  const subtotal = items.reduce((sum, i) => sum + (i.quantity || 1) * (i.product?.price || 0), 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-ink-900">Your Cart</h1>
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
          {items.map((item) => (
            <div key={item._id} className="flex items-center gap-4 rounded-xl border border-ink-100 bg-white p-4">
              <img src={item.product?.images?.[0]} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink-800">{item.product?.title}</p>
                <p className="text-xs text-ink-400">Qty {item.quantity || 1}</p>
              </div>
              <span className="font-semibold">{formatNPR((item.quantity || 1) * (item.product?.price || 0))}</span>
            </div>
          ))}
          <div className="flex justify-between rounded-xl border border-ink-100 bg-white p-4 text-base font-semibold">
            <span>Subtotal</span>
            <span>{formatNPR(subtotal)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
