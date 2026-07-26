const REASON_LABELS = {
  counterfeit: "Counterfeit or fake item",
  misleading_description: "Misleading description",
  inappropriate_images: "Inappropriate images",
  prohibited_item: "Prohibited item",
  other: "Other",
};

export function reasonLabel(reason) {
  return REASON_LABELS[reason] || reason || "Unknown";
}

export function normalizeReport(r = {}) {
  return {
    id: r._id || r.id,
    productId: r.product?._id || r.product,
    productName: r.product?.name || "Deleted product",
    productImage: r.product?.images?.[0]?.url || "",
    productIsActive: r.product?.isActive !== false,
    reporterName: r.reporter?.name || "Unknown user",
    reporterEmail: r.reporter?.email || "",
    reason: r.reason || "other",
    details: r.details || "",
    status: r.status || "pending",
    resolvedByName: r.resolvedBy?.name || "",
    resolvedAt: r.resolvedAt || null,
    createdAt: r.createdAt,
  };
}

export function normalizeReportList(payload) {
  const raw = Array.isArray(payload)
    ? payload
    : payload?.reports || payload?.data?.reports || payload?.data || [];
  return Array.isArray(raw) ? raw.map(normalizeReport) : [];
}
