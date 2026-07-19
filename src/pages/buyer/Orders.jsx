import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import orderService from "../../services/orderService";
import { formatNPR } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const STATUS_STYLES = {
  pending: "bg-mustard-100 text-ink-800",
  confirmed: "bg-forest-100 text-forest-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-forest-600 text-cream-50",
  cancelled: "bg-red-100 text-red-600",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getMyOrders()
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-ink-900">My Orders</h1>
      {loading ? (
        <LoadingSpinner label="Loading orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          message="Once you buy something, it'll show up here."
          action={
            <Link to="/products" className="mt-1 text-sm font-semibold text-rust-500 hover:underline">
              Start shopping
            </Link>
          }
        />
      ) : (
        <div className="divide-y divide-ink-50 rounded-xl border border-ink-100 bg-white">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-cream-50"
            >
              <div>
                <p className="font-medium text-ink-800">#{order._id?.slice(-6).toUpperCase()}</p>
                <p className="text-xs text-ink-400">{formatDate(order.createdAt)}</p>
              </div>
              <span className="font-semibold">{formatNPR(order.total)}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[order.status] || "bg-ink-100 text-ink-600"}`}>
                {order.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
