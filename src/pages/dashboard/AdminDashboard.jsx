import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  UserCheck,
  Store,
  Package,
  PackageSearch,
  ClipboardCheck,
  ShoppingBag,
  Wallet,
  Flag,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import adminService from "../../services/adminService";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import SalesChart from "../../components/admin/SalesChart";
import { formatNPR } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import {
  normalizeStats,
  normalizeSalesChart,
  normalizeReportedProducts,
  normalizeOrders,
} from "../../utils/normalizeAdminData";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(normalizeStats());
  const [salesData, setSalesData] = useState([]);
  const [reportedProducts, setReportedProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [dashboardRes, statsRes, ordersRes] = await Promise.allSettled([
        adminService.getDashboard(),
        adminService.getStats(),
        adminService.getRecentOrders({ limit: 8 }),
      ]);

      if (!active) return;

      if (dashboardRes.status === "rejected" && statsRes.status === "rejected") {
        toast.error("Couldn't load dashboard data. Please try again.");
      }
      if (ordersRes.status === "rejected") {
        toast.error("Couldn't load recent orders.");
      }

      const dashboard = dashboardRes.status === "fulfilled" ? dashboardRes.value.data?.data ?? dashboardRes.value.data : {};
      const statsPayload = statsRes.status === "fulfilled" ? statsRes.value.data?.data ?? statsRes.value.data : {};
      const orders = ordersRes.status === "fulfilled" ? ordersRes.value.data?.data ?? ordersRes.value.data : [];

      setStats(normalizeStats(dashboard, statsPayload));
      setSalesData(normalizeSalesChart(dashboard, statsPayload));
      setReportedProducts(normalizeReportedProducts(dashboard, statsPayload));
      setRecentOrders(normalizeOrders(orders?.orders || orders || dashboard?.recentOrders || []));

      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink-900">
          Welcome back, {user?.name || "Admin"}
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Here's what's happening across ReWear Nepal today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} accent="forest" to="/admin/users" />
        <StatCard label="Total Buyers" value={stats.totalBuyers} icon={UserCheck} accent="forest" to="/admin/users" />
        <StatCard label="Total Sellers" value={stats.totalSellers} icon={Store} accent="forest" to="/admin/sellers" />
        <StatCard label="Total Products" value={stats.totalProducts} icon={Package} accent="mustard" to="/admin/products" />
        <StatCard
          label="Pending Product Approvals"
          value={stats.pendingProductApprovals}
          icon={PackageSearch}
          accent="rust"
          to="/admin/products"
        />
        <StatCard
          label="Pending Seller Approvals"
          value={stats.pendingSellerApprovals}
          icon={ClipboardCheck}
          accent="rust"
          to="/admin/sellers"
        />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} accent="forest" to="/admin/orders" />
        <StatCard label="Total Revenue" value={formatNPR(stats.totalRevenue)} icon={Wallet} accent="mustard" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales chart */}
        <div className="rounded-xl border border-ink-100 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-900">Sales Overview</h3>
            <span className="text-xs text-ink-400">Revenue by period</span>
          </div>
          <SalesChart data={salesData} />
        </div>

        {/* Reported products */}
        <div className="rounded-xl border border-ink-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Flag className="h-4 w-4 text-rust-500" /> Reported Products
            </h3>
            <Link to="/admin/reports" className="text-xs font-semibold text-rust-500 hover:underline">
              View all
            </Link>
          </div>

          {reportedProducts.length === 0 ? (
            <EmptyState
              icon={Flag}
              title="No reports"
              message="No products have been reported."
            />
          ) : (
            <ul className="space-y-3">
              {reportedProducts.slice(0, 5).map((item) => (
                <li key={item.id} className="rounded-lg border border-ink-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium text-ink-800">{item.title}</p>
                    <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                      {item.reportCount} report{item.reportCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-400">Seller: {item.seller}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border border-ink-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-900">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs font-semibold text-rust-500 hover:underline">
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No recent orders" message="New orders will show up here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Buyer</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-ink-50 last:border-0">
                    <td className="py-2.5 font-medium text-ink-800">#{order.orderNumber}</td>
                    <td className="py-2.5 text-ink-600">{order.buyer}</td>
                    <td className="py-2.5 text-ink-800">{formatNPR(order.amount)}</td>
                    <td className="py-2.5">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-2.5 text-ink-400">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
