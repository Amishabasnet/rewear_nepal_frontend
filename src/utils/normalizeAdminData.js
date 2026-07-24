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
    totalProducts: pick(merged, ["totalProducts", "productsCount", "counts.products"]),
    pendingProductApprovals: pick(merged, [
      "pendingProductsCount",
      "pendingProductApprovals",
      "pendingProducts",
      "products.pending",
      "counts.pendingProducts",
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
