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
  UserCog,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Boxes,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import sellerService from "../../services/sellerService";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import { formatNPR } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const APPROVAL_META = {
  approved: {
    label: "Verified seller",
    icon: ShieldCheck,
    className: "bg-forest-50 text-forest-700 border-forest-200",
  },
  pending: {
    label: "Pending admin approval",
    icon: ShieldQuestion,
    className: "bg-mustard-400/10 text-ink-700 border-mustard-400/40",
  },
  rejected: {
    label: "Verification rejected",
    icon: ShieldAlert,
    className: "bg-red-50 text-red-600 border-red-200",
  },
};

const LOW_STOCK_THRESHOLD = 5;

export default function SellerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [profileRes, dashboardRes, productsRes, ordersRes] = await Promise.allSettled([
        sellerService.getProfile(),
        sellerService.getDashboard(),
        sellerService.getProducts(),
        sellerService.getOrders(),
      ]);

      if (!active) return;

      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value.data?.seller || profileRes.value.data?.profile || profileRes.value.data);
      }
      if (dashboardRes.status === "fulfilled") {
        setStats(dashboardRes.value.data?.stats || dashboardRes.value.data);
      }
      if (productsRes.status === "fulfilled") {
        setProducts(productsRes.value.data?.products || productsRes.value.data || []);
      }
      if (ordersRes.status === "fulfilled") {
        setOrders(ordersRes.value.data?.orders || ordersRes.value.data || []);
      }

      if (
        [profileRes, dashboardRes, productsRes, ordersRes].every((r) => r.status === "rejected")
      ) {
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

  const approvalStatus =
    profile?.approvalStatus || profile?.status || user?.approvalStatus || "pending";
  const approvalMeta = APPROVAL_META[approvalStatus] || APPROVAL_META.pending;
  const ApprovalIcon = approvalMeta.icon;

  const totalProducts = stats?.totalProducts ?? stats?.totalListedProducts ?? products.length;
  const totalSold =
    stats?.totalSold ?? stats?.totalSoldProducts ?? orders.filter((o) => o.status === "delivered").length;
  const pendingOrders =
    stats?.pendingOrders ?? orders.filter((o) => o.status === "pending" || o.status === "confirmed").length;
  const totalEarnings = stats?.totalEarnings ?? stats?.earnings ?? 0;

  const recentOrders = (stats?.recentOrders || orders)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const lowStockProducts = (stats?.lowStockProducts || products).filter(
    (p) => (p.stock ?? p.quantity ?? 0) <= LOW_STOCK_THRESHOLD
  );

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900">
              Welcome back, {profile?.shopName || user?.name?.split(" ")[0] || "Seller"} 👋
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Here's how your shop{profile?.shopName ? ` "${profile.shopName}"` : ""} is doing today.
            </p>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${approvalMeta.className}`}
          >
            <ApprovalIcon className="h-4 w-4" />
            {approvalMeta.label}
          </span>
        </div>

        {approvalStatus === "pending" && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-mustard-400/10 p-3 text-xs text-ink-600">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-mustard-600" />
            <p>
              Your shop is still under review. You can browse your dashboard, but listings may not
              go live until an admin approves your seller account.
            </p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        <Link
          to="/seller/profile"
          className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold text-ink-700 transition hover:bg-cream-100"
        >
          <UserCog className="h-4 w-4" /> Edit Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Listed products" value={totalProducts} icon={Package} accent="forest" to="/seller/products" />
        <StatCard label="Sold products" value={totalSold} icon={CheckCircle2} accent="rust" />
        <StatCard label="Pending orders" value={pendingOrders} icon={Clock} accent="mustard" to="/seller/orders" />
        <StatCard label="Total earnings" value={formatNPR(totalEarnings)} icon={Wallet} accent="forest" />
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
                <div key={order._id || order.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink-800">
                      #{(order._id || order.id || "").toString().slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-ink-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className="font-semibold text-ink-800">{formatNPR(order.total)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock products */}
        <div className="rounded-xl border border-ink-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">Low stock products</h2>
            <Link to="/seller/products" className="text-xs font-semibold text-rust-500 hover:underline">
              Manage products
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="Stock levels look healthy"
              message="We'll flag items here once stock runs low."
            />
          ) : (
            <div className="divide-y divide-ink-50">
              {lowStockProducts.map((p) => (
                <div key={p._id || p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                      {p.image || p.images?.[0] ? (
                        <img
                          src={p.image || p.images[0]}
                          alt={p.name || p.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <p className="truncate font-medium text-ink-800">{p.name || p.title}</p>
                  </div>
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                    {(p.stock ?? p.quantity ?? 0)} left
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
