import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import orderService from "../../services/orderService";
import { formatNPR } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { Package } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getOrderById(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/orders" className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-rust-500">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      {loading ? (
        <LoadingSpinner label="Loading order..." />
      ) : !order ? (
        <EmptyState icon={Package} title="Order not found" message="This order could not be loaded." />
      ) : (
        <div className="rounded-xl border border-ink-100 bg-white p-6">
          <h1 className="text-xl font-semibold text-ink-900">
            Order #{order._id?.slice(-6).toUpperCase()}
          </h1>
          <p className="text-sm text-ink-400">Placed on {formatDate(order.createdAt)}</p>
          <p className="mt-4 text-2xl font-bold text-rust-500">{formatNPR(order.total)}</p>
          <p className="mt-1 text-sm capitalize text-ink-600">Status: {order.status}</p>
        </div>
      )}
    </div>
  );
}
