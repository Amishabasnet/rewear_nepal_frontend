export function normalizeSeller(s = {}) {
  const isBlocked = !!s.isBlocked || s.status === "blocked" || s.blocked === true;
  const approvalStatus = s.approvalStatus || (s.status === "blocked" ? "approved" : s.status) || "pending";

  return {
    id: s._id || s.id,
    fullName: s.fullName || s.name || s.ownerName || "Unknown",
    shopName: s.shopName || s.shopname || s.storeName || "Unnamed shop",
    email: s.email || "",
    phone: s.phone || s.phoneNumber || "",
    address: s.address || "",
    city: s.city || s.location || "",
    shopDescription: s.shopDescription || s.description || "",
    documentImage: s.documentImage || s.citizenshipImage || s.idImage || "",
    profileImage: s.profileImage || s.logo || s.shopLogo || "",
    approvalStatus,
    isBlocked,
    status: isBlocked ? "blocked" : approvalStatus,
    productsCount: s.productsCount ?? s.totalProducts ?? null,
    rejectionReason: s.rejectionReason || s.rejectReason || s.rejection_reason || "",
    createdAt: s.createdAt || s.registeredAt || s.date,
  };
}

export function normalizeSellerList(payload) {
  const raw = Array.isArray(payload)
    ? payload
    : payload?.sellers || payload?.data?.sellers || payload?.data || [];
  return Array.isArray(raw) ? raw.map(normalizeSeller) : [];
}
