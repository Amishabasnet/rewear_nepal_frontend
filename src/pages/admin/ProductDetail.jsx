import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trash2,
  Store,
  MapPin,
  Tag,
  Layers,
  Ruler,
} from "lucide-react";

import adminService from "../../services/adminService";
import ImageGallery from "../../components/ImageGallery";
import ProductStatusBadge from "../../components/seller/ProductStatusBadge";
import ConfirmModal from "../../components/admin/ConfirmModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { normalizeProduct, normalizeProductList } from "../../utils/normalizeAdminProducts";
import { formatNPR } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

export default function AdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [modalType, setModalType] = useState(null); // "approve" | "reject" | "delete"
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const { data } = await adminService.getProduct(id);
      setProduct(normalizeProduct(data?.data ?? data));
    } catch {
      try {
        const { data } = await adminService.getProducts();
        const list = normalizeProductList(data?.data ?? data);
        const found = list.find((p) => p.id === id);
        if (found) setProduct(found);
        else setNotFound(true);
      } catch {
        setNotFound(true);
        toast.error("Could not load this product");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const closeModal = () => {
    if (!actionLoading) setModalType(null);
  };

  const runAction = async (fn, successMsg, { redirectAfter = false } = {}) => {
    setActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
      setModalType(null);
      if (redirectAfter) {
        navigate("/admin/products");
      } else {
        load();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = () => runAction(() => adminService.approveProduct(id), "Product approved");
  const handleReject = (reason) =>
    runAction(() => adminService.rejectProduct(id, reason), "Product rejected");
  const handleDelete = () =>
    runAction(() => adminService.deleteProduct(id), "Product deleted", { redirectAfter: true });

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner label="Loading product..." />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <EmptyState
        title="Product not found"
        message="This product may have been deleted."
        action={
          <Link to="/admin/products" className="mt-1 text-sm font-semibold text-rust-500 hover:underline">
            Back to all products
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all products
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ImageGallery images={product.images} alt={product.title} />

        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ProductStatusBadge status={product.status} />
            </div>
            <h1 className="text-2xl font-semibold text-ink-900">{product.title}</h1>
            <p className="mt-1 text-xl font-semibold text-rust-500">{formatNPR(product.price)}</p>
          </div>

          {product.status === "rejected" && product.rejectionReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p className="font-semibold">Rejection reason</p>
              <p className="mt-0.5">{product.rejectionReason}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-ink-100 bg-white p-4 text-sm">
            <div className="flex items-center gap-2 text-ink-600">
              <Tag className="h-4 w-4 text-ink-400" /> {product.category || "—"}
            </div>
            <div className="flex items-center gap-2 text-ink-600">
              <Layers className="h-4 w-4 text-ink-400" /> {product.condition || "—"}
            </div>
            <div className="flex items-center gap-2 text-ink-600">
              <Ruler className="h-4 w-4 text-ink-400" /> Size {product.size || "—"}
            </div>
            <div className="flex items-center gap-2 text-ink-600">
              <MapPin className="h-4 w-4 text-ink-400" /> {product.location || "—"}
            </div>
          </div>

          <div className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-800">
              <Store className="h-4 w-4 text-ink-400" /> Seller
            </p>
            <p className="text-sm text-ink-700">{product.sellerName}</p>
            {product.sellerEmail && <p className="text-xs text-ink-400">{product.sellerEmail}</p>}
          </div>

          {product.description && (
            <div>
              <p className="mb-1 text-sm font-semibold text-ink-800">Description</p>
              <p className="text-sm leading-relaxed text-ink-600">{product.description}</p>
            </div>
          )}

          <p className="text-xs text-ink-400">Listed {formatDate(product.createdAt)}</p>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 border-t border-ink-100 pt-5">
            {product.status === "pending" && (
              <>
                <button
                  type="button"
                  onClick={() => setModalType("approve")}
                  className="flex items-center gap-2 rounded-full bg-forest-600 px-4 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-700"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => setModalType("reject")}
                  className="flex items-center gap-2 rounded-full border border-mustard-400/60 px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-mustard-100"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setModalType("delete")}
              className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={modalType === "approve"}
        title="Approve this product?"
        message={`"${product.title}" will become visible to buyers.`}
        confirmLabel="Approve"
        tone="success"
        loading={actionLoading}
        onConfirm={handleApprove}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modalType === "reject"}
        title="Reject this product?"
        message={`Let the seller know why "${product.title}" is being rejected.`}
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
        open={modalType === "delete"}
        title="Delete this product?"
        message={`This permanently removes "${product.title}". This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onClose={closeModal}
      />
    </div>
  );
}
