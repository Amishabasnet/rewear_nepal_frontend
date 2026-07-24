import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Flag, Eye, Ban, ShieldCheck } from "lucide-react";

import adminService from "../../services/adminService";
import Select from "../Select";
import Pagination from "../Pagination";
import LoadingSpinner from "../LoadingSpinner";
import EmptyState from "../EmptyState";
import ConfirmModal from "./ConfirmModal";
import { useQueryParams } from "../../hooks/useQueryParams";
import { normalizeReportList, reasonLabel as getReasonLabel } from "../../utils/normalizeAdminReports";
import { formatDate } from "../../utils/formatDate";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "dismissed", label: "Dismissed" },
  { value: "actioned", label: "Actioned" },
];

const STATUS_BADGE = {
  pending: "bg-mustard-100 text-ink-800",
  dismissed: "bg-ink-100 text-ink-600",
  actioned: "bg-red-100 text-red-600",
};

const PAGE_SIZE = 10;

const iconButtonBase =
  "flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40";

export default function AdminReportsList() {
  const { params, setParams } = useQueryParams();
  const status = params.status || "pending";
  const page = Number(params.page) || 1;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type: "dismiss" | "remove", report }
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .getReports(status ? { status } : undefined)
      .then(({ data }) => setReports(normalizeReportList(data?.data ?? data)))
      .catch(() => {
        setReports([]);
        toast.error("Could not load reports");
      })
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(
    () => reports.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [reports, currentPage]
  );

  const closeModal = () => {
    if (!actionLoading) setModal(null);
  };

  const runResolve = async (action, successMsg) => {
    setActionLoading(true);
    try {
      await adminService.resolveReport(modal.report.id, action);
      toast.success(successMsg);
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not resolve this report");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = () => runResolve("dismiss", "Report dismissed");
  const handleRemove = () => runResolve("remove_product", "Listing removed");

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-ink-900">Reported Products</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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
        <LoadingSpinner label="Loading reports..." />
      ) : paged.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No reports found"
          message="Nothing here for this status filter."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-ink-100 bg-cream-50 text-xs uppercase text-ink-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Reported by</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Reported</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {paged.map((r) => (
                <tr key={r.id} className="hover:bg-cream-50">
                  <td className="px-4 py-3 font-medium text-ink-800">
                    <div>{r.productName}</div>
                    {!r.productIsActive && (
                      <span className="text-xs text-red-500">Currently deactivated</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    <div>{r.reporterName}</div>
                    <div className="text-xs text-ink-400">{r.reporterEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    <div>{getReasonLabel(r.reason)}</div>
                    {r.details && <div className="max-w-[220px] truncate text-xs text-ink-400">{r.details}</div>}
                  </td>
                  <td className="px-4 py-3 text-ink-400">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        STATUS_BADGE[r.status] || STATUS_BADGE.pending
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {r.productId && (
                        <Link
                          to={`/admin/products/${r.productId}`}
                          className={`${iconButtonBase} border-ink-200 text-ink-600 hover:bg-cream-100`}
                          aria-label="View product"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      )}
                      {r.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setModal({ type: "dismiss", report: r })}
                            className={`${iconButtonBase} border-forest-200 text-forest-600 hover:bg-forest-50`}
                            aria-label="Dismiss report"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setModal({ type: "remove", report: r })}
                            className={`${iconButtonBase} border-red-200 text-red-500 hover:bg-red-50`}
                            aria-label="Remove listing"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        </>
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
        open={modal?.type === "dismiss"}
        title="Dismiss this report?"
        message={modal?.report ? `"${modal.report.productName}" will stay listed as-is.` : ""}
        confirmLabel="Dismiss"
        tone="default"
        loading={actionLoading}
        onConfirm={handleDismiss}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modal?.type === "remove"}
        title="Remove this listing?"
        message={
          modal?.report
            ? `"${modal.report.productName}" will be deactivated and taken off the marketplace. This also resolves any other pending reports on the same product.`
            : ""
        }
        confirmLabel="Remove listing"
        tone="danger"
        loading={actionLoading}
        onConfirm={handleRemove}
        onClose={closeModal}
      />
    </div>
  );
}
