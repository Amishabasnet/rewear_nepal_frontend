import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ShoppingBag } from "lucide-react";

import adminService from "../../services/adminService";
import SearchBar from "../SearchBar";
import Select from "../Select";
import Pagination from "../Pagination";
import LoadingSpinner from "../LoadingSpinner";
import EmptyState from "../EmptyState";
import OrderStatusBadge from "../OrderStatusBadge";
import { useQueryParams } from "../../hooks/useQueryParams";
import { normalizeOrderList } from "../../utils/normalizeAdminOrders";
import { formatDate } from "../../utils/formatDate";
import { formatNPR } from "../../utils/formatCurrency";

// Values must match the backend's ORDER_STATUSES enum exactly (orderConstants.js)
const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Processing", label: "Processing" },
  { value: "Shipped", label: "Shipped" },
  { value: "Delivered", label: "Delivered" },
  { value: "Cancelled", label: "Cancelled" },
];

const PAGE_SIZE = 10;

export default function AdminOrdersList() {
  const { params, setParams } = useQueryParams();
  const search = params.search || "";
  const status = params.status || "";
  const page = Number(params.page) || 1;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .getOrders()
      .then(({ data }) => setOrders(normalizeOrderList(data?.data ?? data)))
      .catch(() => {
        setOrders([]);
        toast.error("Could not load orders");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus = status ? o.status === status : true;
      const matchesSearch = term
        ? o.id.toLowerCase().includes(term) ||
          o.buyerName.toLowerCase().includes(term) ||
          o.buyerEmail.toLowerCase().includes(term)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleStatusChange = async (order, nextStatus) => {
    if (nextStatus === order.status) return;
    setUpdatingId(order.id);
    try {
      await adminService.updateOrderStatus(order.id, nextStatus);
      toast.success(`Order updated to "${nextStatus}"`);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-ink-900">All Orders</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:max-w-sm sm:flex-1">
          <SearchBar
            value={search}
            onSearch={(v) => setParams({ search: v })}
            placeholder="Search by order ID, buyer name, or email..."
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={status}
            onChange={(e) => setParams({ status: e.target.value })}
            options={STATUS_OPTIONS}
            placeholder="All statuses"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading orders..." />
      ) : paged.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          message="Try adjusting your search or status filter."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-ink-100 bg-cream-50 text-xs uppercase text-ink-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Buyer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Placed</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Update status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {paged.map((o) => (
                <tr key={o.id} className="hover:bg-cream-50">
                  <td className="px-4 py-3 font-medium text-ink-800">
                    #{o.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    <div>{o.buyerName}</div>
                    <div className="text-xs text-ink-400">{o.buyerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{o.itemCount}</td>
                  <td className="px-4 py-3 font-semibold">{formatNPR(o.total)}</td>
                  <td className="px-4 py-3 text-ink-400">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <select
                        value={o.status}
                        disabled={updatingId === o.id || o.status === "Cancelled"}
                        onChange={(e) => handleStatusChange(o, e.target.value)}
                        className="rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs text-ink-700 outline-none focus:border-rust-500 focus:ring-1 focus:ring-rust-500 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setParams({ page: p }, { resetPage: false })}
      />
    </div>
  );
}
