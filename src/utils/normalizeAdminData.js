function pick(source, keys, fallback = 0) {
  if (!source) return fallback;
  for (const key of keys) {
    const value = key.split(".").reduce((acc, k) => acc?.[k], source);
    if (value !== undefined && value !== null) return value;
  }
  return fallback;
}

export function normalizeStats(dashboard = {}, stats = {}) {
  // Stats endpoint is treated as a fallback source in case dashboard doesn't include a field
  const merged = { ...stats, ...dashboard };

  return {
    totalUsers: pick(merged, ["totalUsers", "usersCount", "users.total", "counts.users"]),
    totalBuyers: pick(merged, ["totalBuyers", "buyersCount", "users.buyers", "counts.buyers"]),
    totalSellers: pick(merged, ["totalSellers", "sellersCount", "users.sellers", "counts.sellers"]),
    totalProducts: pick(merged, ["totalProducts", "productsCount", "counts.products"]),
    pendingProductApprovals: pick(merged, [
      "pendingProductApprovals",
      "pendingProducts",
      "products.pending",
      "counts.pendingProducts",
    ]),
    pendingSellerApprovals: pick(merged, [
      "pendingSellerApprovals",
      "pendingSellers",
      "sellers.pending",
      "counts.pendingSellers",
    ]),
    totalOrders: pick(merged, ["totalOrders", "ordersCount", "counts.orders"]),
    totalRevenue: pick(merged, ["totalRevenue", "revenue", "counts.revenue"]),
  };
}

export function normalizeSalesChart(dashboard = {}, stats = {}) {
  const raw =
    dashboard.salesChart ||
    dashboard.salesOverview ||
    dashboard.monthlySales ||
    stats.salesChart ||
    stats.salesOverview ||
    stats.monthlySales ||
    [];

  if (!Array.isArray(raw)) return [];

  return raw.map((item, index) => ({
    label: item.label || item.month || item.date || item.period || `#${index + 1}`,
    value: Number(item.value ?? item.revenue ?? item.total ?? item.sales ?? 0),
  }));
}

export function normalizeReportedProducts(dashboard = {}, stats = {}) {
  const raw = dashboard.reportedProducts || stats.reportedProducts || [];
  if (!Array.isArray(raw)) return [];

  return raw.map((item) => ({
    id: item._id || item.id,
    title: item.title || item.name || item.productName || "Untitled product",
    seller: item.sellerName || item.seller?.name || item.shopName || "Unknown seller",
    reportCount: item.reportCount ?? item.reports ?? item.reportsCount ?? 0,
    reason: item.reason || item.lastReportReason || "No reason provided",
  }));
}

export function normalizeOrders(recentOrders = []) {
  const raw = Array.isArray(recentOrders) ? recentOrders : recentOrders?.orders || [];

  return raw.map((order) => ({
    id: order._id || order.id,
    orderNumber: order.orderNumber || order._id?.slice(-6) || order.id?.slice?.(-6) || "N/A",
    buyer: order.buyerName || order.buyer?.name || order.user?.name || "Unknown buyer",
    amount: Number(order.totalAmount ?? order.total ?? order.amount ?? 0),
    status: order.status || "pending",
    createdAt: order.createdAt || order.date,
  }));
}
