import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import orderService from "../../services/orderService";
import { formatNPR } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getOrderById(id)
      .then(({ data }) => setOrder(data.order || data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <LoadingSpinner label="Confirming your order..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-forest-50 text-forest-600">
        <CheckCircle2 className="h-9 w-9" />
      </div>

      <h1 className="mb-2 text-2xl font-semibold text-ink-900">Order placed!</h1>
      <p className="mb-6 text-sm text-ink-500">
        Thanks for shopping with ReWear Nepal. We'll notify you as your order is prepared for delivery.
      </p>

      {order ? (
        <div className="mb-6 rounded-xl border border-ink-100 bg-white p-5 text-left text-sm">
          <div className="flex items-center justify-between border-b border-dashed border-ink-200 pb-3">
            <span className="text-ink-500">Order number</span>
            <span className="font-semibold text-ink-900">
              #{(order._id || order.id || id).toString().slice(-6).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-ink-500">Placed on</span>
            <span className="font-medium text-ink-800">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-ink-500">Payment method</span>
            <span className="font-medium capitalize text-ink-800">
              {order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 text-base font-semibold text-ink-900">
            <span>Total paid</span>
            <span>{formatNPR(order.total)}</span>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="Order confirmation unavailable"
          message="We couldn't load the order details, but your order has been placed."
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to={`/orders/${id}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rust-500 px-5 py-2.5 text-sm font-semibold text-cream-50 hover:bg-rust-600"
        >
          <Package className="h-4 w-4" /> View Order
        </Link>
        <Link
          to="/products"
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-cream-100"
        >
          <ShoppingBag className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}
