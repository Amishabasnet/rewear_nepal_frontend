import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Package,
  CheckCircle2,
  Clock,
  Wallet,
  PlusCircle,
  ShoppingBag,
  Boxes,
  Pencil,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import sellerService from "../../services/sellerService";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import ProductStatusBadge from "../../components/seller/ProductStatusBadge";
import { PRODUCT_STATUS_META } from "../../utils/constants";
import { formatOrderNumber } from "../../utils/formatOrderNumber";
import { formatNPR } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { getImageUrl } from "../../utils/getImageUrl";

const LOW_STOCK_THRESHOLD = 5;
const LISTING_PREVIEW_COUNT = 6;

export default function SellerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [productsRes, ordersRes] = await Promise.allSettled([
        sellerService.getProducts(),
        sellerService.getOrders(),
      ]);

      if (!active) return;

      if (productsRes.status === "fulfilled") {
        setProducts(productsRes.value.data?.data || []);
      }
      if (ordersRes.status === "fulfilled") {
        setOrders(ordersRes.value.data?.data || []);
      }
      if (productsRes.status === "rejected" && ordersRes.status === "rejected") {
        toast.error("Could not load your dashboard right now");
      }

      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading your dashboard..." />;
  }

  const approvedProducts = products.filter((p) => p.approvalStatus === "approved");
  const pendingProducts = products.filter((p) => p.approvalStatus === "pending");
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "Pending" || o.orderStatus === "Processing"
  );
  const totalEarnings = orders
    .filter((o) => o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + (o.mySubtotal || 0), 0);

  const recentOrders = orders
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const lowStockProducts = approvedProducts.filter((p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD);

  const recentListings = products
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, LISTING_PREVIEW_COUNT);

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h1 className="text-2xl font-semibold text-ink-900">
          Welcome back, {user?.name?.split(" ")[0] || "there"} \ud83d\udc4b
        </h1>
        <p className="mt-1 text-sm text-ink-500">Here's how your listings are doing today.</p>

        {pendingProducts.length > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-mustard-400/10 p-3 text-xs text-ink-600">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-mustard-600" />
            <p>
              {pendingProducts.length} listing{pendingProducts.length > 1 ? "s" : ""} awaiting
              admin approval before {pendingProducts.length > 1 ? "they" : "it"} go live.
            </p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link
          to="/seller/products/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-rust-500 px-4 py-3 text-sm font-semibold text-cream-50 transition hover:bg-rust-600"
        >
          <PlusCircle className="h-4 w-4" /> Add Product
        </Link>
        <Link
          to="/seller/products"
          className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-700 transition hover:bg-cream-100"
        >
          <Package className="h-4 w-4" /> My Products
        </Link>
        <Link
          to="/seller/orders"
          className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-700 transition hover:bg-cream-100"
        >
          <ShoppingBag className="h-4 w-4" /> View Orders
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Listed products" value={products.length} icon={Package} accent="forest" to="/seller/products" />
        <StatCard label="Live & approved" value={approvedProducts.length} icon={CheckCircle2} accent="rust" />
        <StatCard label="Pending orders" value={pendingOrders.length} icon={Clock} accent="mustard" to="/seller/orders" />
        <StatCard label="Total earnings" value={formatNPR(totalEarnings)} icon={Wallet} accent="forest" />
      </div>

      {/* Product listings */}
      <div className="rounded-xl border border-ink-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-900">Your product listings</h2>
          <div className="flex items-center gap-3">
            <Link
              to="/seller/products/new"
              className="flex items-center gap-1.5 text-xs font-semibold text-forest-600 hover:underline"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Add product
            </Link>
            <Link to="/seller/products" className="text-xs font-semibold text-rust-500 hover:underline">
              View all
            </Link>
          </div>
        </div>

        {recentListings.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products listed yet"
            message="List your first item to start selling on ReWear Nepal."
            action={
              <Link to="/seller/products/new" className="mt-1 text-sm font-semibold text-rust-500 hover:underline">
                Add a product
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 text-xs uppercase text-ink-400">
                <tr>
                  <th className="px-2 py-3 font-semibold">Product</th>
                  <th className="px-2 py-3 font-semibold">Price</th>
                  <th className="px-2 py-3 font-semibold">Stock</th>
                  <th className="px-2 py-3 font-semibold">Status</th>
                  <th className="px-2 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {recentListings.map((p) => {
                  const id = p._id || p.id;
                  const stock = p.stock ?? p.quantity ?? 0;
                  return (
                    <tr key={id} className="hover:bg-cream-50">
                      <td className="flex items-center gap-3 px-2 py-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                          {getImageUrl(p.image || p.images?.[0]) ? (
                            <img
                              src={getImageUrl(p.image || p.images[0])}
                              alt={p.name || p.title}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <span className="max-w-[160px] truncate font-medium text-ink-800">
                          {p.name || p.title}
                        </span>
                      </td>
                      <td className="px-2 py-3">{formatNPR(p.price)}</td>
                      <td className="px-2 py-3">
                        <span className={stock <= LOW_STOCK_THRESHOLD ? "font-semibold text-red-600" : "text-ink-700"}>
                          {stock}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <ProductStatusBadge status={p.status || p.approvalStatus} />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center justify-end">
                          <Link
                            to={`/seller/products/${id}/edit`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-600 transition hover:bg-cream-100"
                            aria-label="Edit product"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-xl border border-ink-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">Recent orders</h2>
            <Link to="/seller/orders" className="text-xs font-semibold text-rust-500 hover:underline">
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders yet"
              message="Orders from buyers will show up here."
            />
          ) : (
            <div className="divide-y divide-ink-50">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink-800">
                      #{formatOrderNumber(order._id)}
                    </p>
                    <p className="text-xs text-ink-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className="font-semibold text-ink-800">{formatNPR(order.mySubtotal)}</span>
                  <OrderStatusBadge status={order.orderStatus} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products awaiting approval / low stock */}
        <div className="rounded-xl border border-ink-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">Needs your attention</h2>
            <Link to="/seller/products" className="text-xs font-semibold text-rust-500 hover:underline">
              Manage products
            </Link>
          </div>

          {pendingProducts.length === 0 && lowStockProducts.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="All caught up"
              message="No pending approvals or low-stock items right now."
            />
          ) : (
            <div className="divide-y divide-ink-50">
              {pendingProducts.map((p) => {
                const meta = PRODUCT_STATUS_META[p.approvalStatus] || PRODUCT_STATUS_META.pending;
                return (
                  <div key={p._id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <p className="truncate font-medium text-ink-800">{p.name}</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
                      {meta.label}
                    </span>
                  </div>
                );
              })}
              {lowStockProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <p className="truncate font-medium text-ink-800">{p.name}</p>
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}