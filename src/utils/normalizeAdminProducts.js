export function normalizeProduct(p = {}) {
  const seller = p.seller || p.sellerInfo || {};

  return {
    id: p._id || p.id,
    title: p.title || p.name || "Untitled product",
    price: Number(p.price ?? 0),
    images: p.images?.length ? p.images : p.image ? [p.image] : [],
    category: p.category || "",
    brand: p.brand || "",
    condition: p.condition || "",
    size: p.size || "",
    gender: p.gender || "",
    location: p.location || seller.location || "",
    stock: p.stock ?? p.quantity ?? 0,
    description: p.description || "",
    status: p.status || p.approvalStatus || "pending",
    sellerName: p.sellerName || seller.name || seller.shopName || p.shopName || "Unknown seller",
    sellerId: p.sellerId || seller._id || seller.id || null,
    sellerEmail: p.sellerEmail || seller.email || "",
    rejectionReason: p.rejectionReason || p.rejectReason || p.rejection_reason || "",
    createdAt: p.createdAt || p.date || p.listedAt,
  };
}

export function normalizeProductList(payload) {
  const raw = Array.isArray(payload)
    ? payload
    : payload?.products || payload?.data?.products || payload?.data || [];
  return Array.isArray(raw) ? raw.map(normalizeProduct) : [];
}
