import { useCallback, useEffect, useState } from "react";
import {  useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  FileText,
  Package,
} from "lucide-react";

import adminService from "../../services/adminService";
import SellerStatusBadge from "../../components/admin/SellerStatusBadge";
import ProductStatusBadge from "../../components/seller/ProductStatusBadge";
import ConfirmModal from "../../components/admin/ConfirmModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { normalizeSeller, normalizeSellerList } from "../../utils/normalizeAdminSellers";
import { normalizeProductList } from "../../utils/normalizeAdminProducts";
import { formatNPR } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

export default function AdminSellerDetail() {
  const { id } = useParams();
  

  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // approve | reject | block | unblock
  const [actionLoading, setActionLoading] = useState(false);

  const loadSeller = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const { data } = await adminService.getSeller(id);
      setSeller(normalizeSeller(data?.data ?? data));
    } catch {
      try {
        const { data } = await adminService.getSellers();
        const list = normalizeSellerList(data?.data ?? data);
        const found = list.find((s) => s.id === id);
        if (found) setSeller(found);
        else setNotFound(true);
      } catch {
        setNotFound(true);
        toast.error("Could not load this seller");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadProducts = useCallback(() => {
    setProductsLoading(true);
    adminService
      .getProducts({ sellerId: id })
      .then(({ data }) => {
        const list = normalizeProductList(data?.data ?? data);
        setProducts(list.filter((p) => !p.sellerId || p.sellerId === id));
      })
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSeller();
    loadProducts();
  }, [loadSeller, loadProducts]);

  const closeModal = () => {
    if (!actionLoading) setModalType(null);
  };

  const runAction = async (fn, successMsg) => {
    setActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
      setModalType(null);
      loadSeller();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = () => runAction(() => adminService.approveSeller(id), "Seller approved");
  const handleReject = (reason) =>
    runAction(() => adminService.rejectSeller(id, reason), "Seller rejected");
  const handleBlock = () => runAction(() => adminService.blockSeller(id), "Seller blocked");
  const handleUnblock = () => runAction(() => adminService.unblockSeller(id), "Seller unblocked");

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner label="Loading seller..." />
      </div>
    );
  }

  if (notFound || !seller) {
    return (
      <EmptyState
        title="Seller not found"
        message="This seller account may have been removed."
        action={
          <Link to="/admin/sellers" className="mt-1 text-sm font-semibold text-rust-500 hover:underline">
            Back to all sellers
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/sellers"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all sellers
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile summary */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-ink-100 bg-white p-5 text-center">
            <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-cream-100">
              {seller.profileImage && (
                <img src={seller.profileImage} alt={seller.shopName} className="h-full w-full object-cover" />
              )}
            </div>
            <h1 className="text-lg font-semibold text-ink-900">{seller.shopName}</h1>
            <p className="text-sm text-ink-500">{seller.fullName}</p>
            <div className="mt-2 flex justify-center">
              <SellerStatusBadge status={seller.status} />
            </div>

            <div className="mt-5 space-y-2 text-left text-sm text-ink-600">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-ink-400" /> {seller.email || "—"}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-ink-400" /> {seller.phone || "—"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-ink-400" />
                {[seller.address, seller.city].filter(Boolean).join(", ") || "—"}
              </p>
            </div>

            {seller.shopDescription && (
              <p className="mt-4 border-t border-ink-100 pt-4 text-left text-sm leading-relaxed text-ink-600">
                {seller.shopDescription}
              </p>
            )}

            <p className="mt-4 text-xs text-ink-400">Joined {formatDate(seller.createdAt)}</p>
          </div>

          {seller.status === "rejected" && seller.rejectionReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p className="font-semibold">Rejection reason</p>
              <p className="mt-0.5">{seller.rejectionReason}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2.5 rounded-xl border border-ink-100 bg-white p-4">
            {seller.approvalStatus === "pending" && !seller.isBlocked && (
              <>
                <button
                  type="button"
                  onClick={() => setModalType("approve")}
                  className="flex items-center gap-2 rounded-full bg-forest-600 px-4 py-2 text-sm font-semibold text-cream-50 transition hover:bg-forest-700"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => setModalType("reject")}
                  className="flex items-center gap-2 rounded-full border border-mustard-400/60 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-mustard-100"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </>
            )}
            {seller.isBlocked ? (
              <button
                type="button"
                onClick={() => setModalType("unblock")}
                className="flex items-center gap-2 rounded-full border border-forest-200 px-4 py-2 text-sm font-semibold text-forest-600 transition hover:bg-forest-50"
              >
                <RotateCcw className="h-4 w-4" /> Unblock
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setModalType("block")}
                className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
              >
                <Ban className="h-4 w-4" /> Block
              </button>
            )}
          </div>
        </div>

        {/* Documents + products */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-ink-100 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
              <FileText className="h-4 w-4 text-ink-400" /> Verification Documents
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DocumentThumb label="ID / Citizenship" src={seller.documentImage} />
              <DocumentThumb label="Shop logo / profile" src={seller.profileImage} round />
            </div>
          </div>

          <div className="rounded-xl border border-ink-100 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                <Package className="h-4 w-4 text-ink-400" /> Products
              </h3>
              <span className="text-xs text-ink-400">{products.length} total</span>
            </div>

            {productsLoading ? (
              <LoadingSpinner label="Loading products..." />
            ) : products.length === 0 ? (
              <EmptyState icon={Package} title="No products yet" message="This seller hasn't listed anything." />
            ) : (
              <ul className="divide-y divide-ink-50">
                {products.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                      {p.images[0] && (
                        <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <Link
                      to={`/admin/products/${p.id}`}
                      className="min-w-0 flex-1 truncate text-sm font-medium text-ink-800 hover:text-rust-500"
                    >
                      {p.title}
                    </Link>
                    <span className="text-sm text-ink-600">{formatNPR(p.price)}</span>
                    <ProductStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={modalType === "approve"}
        title="Approve this seller?"
        message={`"${seller.shopName}" will be verified and able to sell.`}
        confirmLabel="Approve"
        tone="success"
        loading={actionLoading}
        onConfirm={handleApprove}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modalType === "reject"}
        title="Reject this seller?"
        message={`Let "${seller.shopName}" know why their application is being rejected.`}
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
        open={modalType === "block"}
        title="Block this seller?"
        message={`"${seller.shopName}" won't be able to log in or sell until unblocked.`}
        confirmLabel="Block"
        tone="danger"
        loading={actionLoading}
        onConfirm={handleBlock}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modalType === "unblock"}
        title="Unblock this seller?"
        message={`"${seller.shopName}" will regain access to their shop.`}
        confirmLabel="Unblock"
        tone="success"
        loading={actionLoading}
        onConfirm={handleUnblock}
        onClose={closeModal}
      />
    </div>
  );
}

function DocumentThumb({ label, src, round = false }) {
  if (!src) {
    return (
      <div className="text-center">
        <div className={`flex aspect-square items-center justify-center bg-cream-100 text-xs text-ink-400 ${round ? "rounded-full" : "rounded-lg"}`}>
          Not provided
        </div>
        <p className="mt-1.5 text-xs text-ink-500">{label}</p>
      </div>
    );
  }

  return (
    <a href={src} target="_blank" rel="noreferrer" className="block text-center">
      <div className={`aspect-square overflow-hidden bg-cream-100 transition hover:opacity-90 ${round ? "rounded-full" : "rounded-lg"}`}>
        <img src={src} alt={label} className="h-full w-full object-cover" />
      </div>
      <p className="mt-1.5 text-xs text-ink-500">{label}</p>
    </a>
  );
}
