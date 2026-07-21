import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, CheckCircle2, XCircle, Trash2, Package } from "lucide-react";

import adminService from "../../services/adminService";
import SearchBar from "../SearchBar";
import Select from "../Select";
import Pagination from "../Pagination";
import LoadingSpinner from "../LoadingSpinner";
import EmptyState from "../EmptyState";
import ProductStatusBadge from "../seller/ProductStatusBadge";
import ConfirmModal from "./ConfirmModal";
import { useQueryParams } from "../../hooks/useQueryParams";
import { normalizeProductList } from "../../utils/normalizeAdminProducts";
import { formatNPR } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const PAGE_SIZE = 10;

const iconButtonBase =
  "flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40";

export default function AdminProductsList({
  title,
  fetchFn,
  lockedStatus,
  emptyTitle = "No products found",
  emptyMessage = "Try a different search or filter.",
}) {
  const { params, setParams } = useQueryParams();
  const search = params.search || "";
  const status = lockedStatus || params.status || "";
  const page = Number(params.page) || 1;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type: "approve" | "reject" | "delete", product }
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchFn({ search, status: lockedStatus || status })
      .then(({ data }) => setProducts(normalizeProductList(data?.data ?? data)))
      .catch(() => {
        setProducts([]);
        toast.error("Could not load products");
      })
      .finally(() => setLoading(false));
  }, [fetchFn, search, status, lockedStatus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Backend query params are honored when supported, but we also filter client-side
  // as a safety net in case an endpoint returns the full unfiltered set.
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesStatus = status ? p.status === status : true;
      const matchesSearch = term
        ? p.title.toLowerCase().includes(term) || p.sellerName.toLowerCase().includes(term)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [products, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const closeModal = () => {
    if (!actionLoading) setModal(null);
  };

  const runAction = async (fn, successMsg) => {
    setActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = () =>
    runAction(() => adminService.approveProduct(modal.product.id), "Product approved");

  const handleReject = (reason) =>
    runAction(() => adminService.rejectProduct(modal.product.id, reason), "Product rejected");

  const handleDelete = () =>
    runAction(() => adminService.deleteProduct(modal.product.id), "Product deleted");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">{title}</h1>
        <div className="mt-3 flex w-fit gap-1 rounded-full border border-ink-100 bg-white p-1">
          <NavLink
            to="/admin/products"
            end
            className={({ isActive }) =>
              `rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                isActive ? "bg-rust-500 text-cream-50" : "text-ink-500 hover:bg-cream-100"
              }`
            }
          >
            All Products
          </NavLink>
          <NavLink
            to="/admin/products/pending"
            className={({ isActive }) =>
              `rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                isActive ? "bg-rust-500 text-cream-50" : "text-ink-500 hover:bg-cream-100"
              }`
            }
          >
            Pending
          </NavLink>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="sm:max-w-sm sm:flex-1">
          <SearchBar
            value={search}
            onSearch={(v) => setParams({ search: v })}
            placeholder="Search by product or seller name..."
          />
        </div>
        {!lockedStatus && (
          <div className="sm:w-48">
            <Select
              value={status}
              onChange={(e) => setParams({ status: e.target.value })}
              options={STATUS_OPTIONS}
              placeholder="All statuses"
            />
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading products..." />
      ) : paged.length === 0 ? (
        <EmptyState icon={Package} title={emptyTitle} message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-ink-100 bg-cream-50 text-xs uppercase text-ink-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Seller</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Listed</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {paged.map((p) => (
                <tr key={p.id} className="hover:bg-cream-50">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                      {p.images[0] && (
                        <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <span className="max-w-[220px] truncate font-medium text-ink-800">{p.title}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{p.sellerName}</td>
                  <td className="px-4 py-3 text-ink-800">{formatNPR(p.price)}</td>
                  <td className="px-4 py-3">
                    <ProductStatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-400">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/products/${p.id}`}
                        className={`${iconButtonBase} border-ink-200 text-ink-600 hover:bg-cream-100`}
                        aria-label="View product"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {p.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setModal({ type: "approve", product: p })}
                            className={`${iconButtonBase} border-forest-200 text-forest-600 hover:bg-forest-50`}
                            aria-label="Approve product"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setModal({ type: "reject", product: p })}
                            className={`${iconButtonBase} border-mustard-400/60 text-ink-700 hover:bg-mustard-100`}
                            aria-label="Reject product"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setModal({ type: "delete", product: p })}
                        className={`${iconButtonBase} border-red-200 text-red-500 hover:bg-red-50`}
                        aria-label="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

      <ConfirmModal
        open={modal?.type === "approve"}
        title="Approve this product?"
        message={modal?.product ? `"${modal.product.title}" will become visible to buyers.` : ""}
        confirmLabel="Approve"
        tone="success"
        loading={actionLoading}
        onConfirm={handleApprove}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modal?.type === "reject"}
        title="Reject this product?"
        message={
          modal?.product
            ? `Let the seller know why "${modal.product.title}" is being rejected.`
            : ""
        }
        confirmLabel="Reject"
        tone="danger"
        requireReason
        reasonLabel="Rejection reason"
        reasonPlaceholder="e.g. Photos don't match the description"
        loading={actionLoading}
        onConfirm={handleReject}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modal?.type === "delete"}
        title="Delete this product?"
        message={
          modal?.product
            ? `This permanently removes "${modal.product.title}". This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        tone="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onClose={closeModal}
      />
    </div>
  );
}
