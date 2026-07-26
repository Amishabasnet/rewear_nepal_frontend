export function normalizeUser(u = {}) {
  return {
    id: u._id || u.id,
    name: u.fullName || u.name || "Unknown",
    email: u.email || "",
    phone: u.phone || u.phoneNumber || "",
    role: u.role || "buyer",
    shopName: u.shopName || "",
    isBlocked: !!u.isBlocked || u.status === "blocked" || u.blocked === true,
    createdAt: u.createdAt || u.registeredAt || u.date,
  };
}

export function normalizeUserList(payload) {
  const raw = Array.isArray(payload)
    ? payload
    : payload?.users || payload?.data?.users || payload?.data || [];
  return Array.isArray(raw) ? raw.map(normalizeUser) : [];
}
