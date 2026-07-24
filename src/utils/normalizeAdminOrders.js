export function normalizeOrder(o = {}) {
  return {
    id: o._id || o.id,
    buyerName: o.user?.name || o.buyerName || "Unknown buyer",
    buyerEmail: o.user?.email || "",
    itemCount: Array.isArray(o.orderItems) ? o.orderItems.length : o.itemCount || 0,
    total: o.totalPrice ?? o.total ?? 0,
    paymentMethod: o.paymentMethod || "",
    paymentStatus: o.paymentStatus || "Pending",
    status: o.orderStatus || o.status || "Pending",
    createdAt: o.createdAt || o.date,
  };
}

export function normalizeOrderList(payload) {
  const raw = Array.isArray(payload)
    ? payload
    : payload?.orders || payload?.data?.orders || payload?.data || [];
  return Array.isArray(raw) ? raw.map(normalizeOrder) : [];
}
