import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import sellerService from "../../services/sellerService";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import { formatNPR } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerService
      .getOrders()
      .then(({ data }) => setOrders(data.orders || data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink-900">Orders</h1>

      {loading ? (
        <LoadingSpinner label="Loading orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          message="Orders placed for your products will show up here."
        />
      ) : (
        <div className="divide-y divide-ink-50 rounded-xl border border-ink-100 bg-white">
          {orders.map((order) => (
            <div
              key={order._id || order.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"
            >
              <div>
                <p className="font-medium text-ink-800">
                  #{(order._id || order.id || "").toString().slice(-6).toUpperCase()}
                </p>
                <p className="text-xs text-ink-400">{formatDate(order.createdAt)}</p>
              </div>
              <p className="text-ink-600">{order.buyerName || order.buyer?.name || "Buyer"}</p>
              <span className="font-semibold">{formatNPR(order.total)}</span>
              <OrderStatusBadge status={order.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
