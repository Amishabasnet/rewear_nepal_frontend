import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, CheckCircle2, XCircle, Ban, RotateCcw, Store } from "lucide-react";

import adminService from "../../services/adminService";
import SearchBar from "../SearchBar";
import Select from "../Select";
import Pagination from "../Pagination";
import LoadingSpinner from "../LoadingSpinner";
import EmptyState from "../EmptyState";
import SellerStatusBadge from "./SellerStatusBadge";
import ConfirmModal from "./ConfirmModal";
import { useQueryParams } from "../../hooks/useQueryParams";
import { normalizeSellerList } from "../../utils/normalizeAdminSellers";
import { formatDate } from "../../utils/formatDate";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "blocked", label: "Blocked" },
];

const PAGE_SIZE = 10;

const iconButtonBase =
  "flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40";

export default function AdminSellersList({
  title,
  fetchFn,
  lockedStatus,
  emptyTitle = "No sellers found",
  emptyMessage = "Try a different search or filter.",
}) {
  const { params, setParams } = useQueryParams();
  const search = params.search || "";
  const status = lockedStatus || params.status || "";
  const page = Number(params.page) || 1;

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type: "approve" | "reject" | "block" | "unblock", seller }
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchFn({ search, status: lockedStatus || status })
      .then(({ data }) => setSellers(normalizeSellerList(data?.data ?? data)))
      .catch(() => {
        setSellers([]);
        toast.error("Could not load sellers");
      })
      .finally(() => setLoading(false));
  }, [fetchFn, search, status, lockedStatus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sellers.filter((s) => {
      const matchesStatus = status ? s.status === status : true;
      const matchesSearch = term
        ? s.shopName.toLowerCase().includes(term) ||
          s.fullName.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [sellers, search, status]);

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
    runAction(() => adminService.approveSeller(modal.seller.id), "Seller approved");
  const handleReject = (reason) =>
    runAction(() => adminService.rejectSeller(modal.seller.id, reason), "Seller rejected");
  const handleBlock = () =>
    runAction(() => adminService.blockSeller(modal.seller.id), "Seller blocked");
  const handleUnblock = () =>
    runAction(() => adminService.unblockSeller(modal.seller.id), "Seller unblocked");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">{title}</h1>
        <div className="mt-3 flex w-fit gap-1 rounded-full border border-ink-100 bg-white p-1">
          <NavLink
            to="/admin/sellers"
            end
            className={({ isActive }) =>
              `rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                isActive ? "bg-rust-500 text-cream-50" : "text-ink-500 hover:bg-cream-100"
              }`
            }
          >
            All Sellers
          </NavLink>
          <NavLink
            to="/admin/sellers/pending"
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
            placeholder="Search by shop, owner, or email..."
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
        <LoadingSpinner label="Loading sellers..." />
      ) : paged.length === 0 ? (
        <EmptyState icon={Store} title={emptyTitle} message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-ink-100 bg-cream-50 text-xs uppercase text-ink-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Shop</th>
                <th className="px-4 py-3 font-semibold">Owner</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {paged.map((s) => (
                <tr key={s.id} className="hover:bg-cream-50">
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-cream-100">
                      {s.profileImage && (
                        <img src={s.profileImage} alt={s.shopName} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <span className="max-w-[180px] truncate font-medium text-ink-800">{s.shopName}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{s.fullName}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-ink-600">{s.email}</td>
                  <td className="px-4 py-3 text-ink-600">{s.city || "—"}</td>
                  <td className="px-4 py-3">
                    <SellerStatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-400">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/sellers/${s.id}`}
                        className={`${iconButtonBase} border-ink-200 text-ink-600 hover:bg-cream-100`}
                        aria-label="View seller"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {s.approvalStatus === "pending" && !s.isBlocked && (
                        <>
                          <button
                            type="button"
                            onClick={() => setModal({ type: "approve", seller: s })}
                            className={`${iconButtonBase} border-forest-200 text-forest-600 hover:bg-forest-50`}
                            aria-label="Approve seller"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setModal({ type: "reject", seller: s })}
                            className={`${iconButtonBase} border-mustard-400/60 text-ink-700 hover:bg-mustard-100`}
                            aria-label="Reject seller"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {s.isBlocked ? (
                        <button
                          type="button"
                          onClick={() => setModal({ type: "unblock", seller: s })}
                          className={`${iconButtonBase} border-forest-200 text-forest-600 hover:bg-forest-50`}
                          aria-label="Unblock seller"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setModal({ type: "block", seller: s })}
                          className={`${iconButtonBase} border-red-200 text-red-500 hover:bg-red-50`}
                          aria-label="Block seller"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
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
        title="Approve this seller?"
        message={modal?.seller ? `"${modal.seller.shopName}" will be verified and able to sell.` : ""}
        confirmLabel="Approve"
        tone="success"
        loading={actionLoading}
        onConfirm={handleApprove}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modal?.type === "reject"}
        title="Reject this seller?"
        message={
          modal?.seller
            ? `Let "${modal.seller.shopName}" know why their application is being rejected.`
            : ""
        }
        confirmLabel="Reject"
        tone="danger"
        requireReason
        reasonLabel="Rejection reason"
        reasonPlaceholder="e.g. Document image is unclear or invalid"
        loading={actionLoading}
        onConfirm={handleReject}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modal?.type === "block"}
        title="Block this seller?"
        message={
          modal?.seller
            ? `"${modal.seller.shopName}" won't be able to log in or sell until unblocked.`
            : ""
        }
        confirmLabel="Block"
        tone="danger"
        loading={actionLoading}
        onConfirm={handleBlock}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modal?.type === "unblock"}
        title="Unblock this seller?"
        message={modal?.seller ? `"${modal.seller.shopName}" will regain access to their shop.` : ""}
        confirmLabel="Unblock"
        tone="success"
        loading={actionLoading}
        onConfirm={handleUnblock}
        onClose={closeModal}
      />
    </div>
  );
}
