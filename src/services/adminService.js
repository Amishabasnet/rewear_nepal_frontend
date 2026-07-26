import api from "./api";

const adminService = {
  // Aggregated dashboard payload — totals, pending approvals, reported products, sales chart
  getDashboard: () => api.get("/admin/dashboard"),

  // Standalone stats endpoint — kept separate so cards can refresh independently of the
  // heavier dashboard payload if the backend splits them
  getStats: () => api.get("/admin/stats"),

  // Recent orders table feed
  getRecentOrders: (params) => api.get("/admin/recent-orders", { params }),

  // Product moderation
  getProducts: (params) => api.get("/admin/products", { params }),
  getPendingProducts: (params) => api.get("/admin/products/pending", { params }),
  // Not in the confirmed backend contract yet — used as a best-effort lookup for the
  // product detail page; callers fall back to searching the full product list on failure.
  getProduct: (id) => api.get(`/admin/products/${id}`),
  approveProduct: (id) => api.put(`/admin/products/${id}/approve`),
  rejectProduct: (id, reason) => api.put(`/admin/products/${id}/reject`, { reason }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Order management — these live under /orders, not /admin, on the backend
  getOrders: (params) => api.get("/orders/admin/all", { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, orderStatus) => api.put(`/orders/${id}/status`, { orderStatus }),

  // Reported products — these live under /reports, not /admin, on the backend
  getReports: (params) => api.get("/reports/admin/all", { params }),
  resolveReport: (id, action) => api.put(`/reports/${id}/resolve`, { action }),

  // User management
  getUsers: (params) => api.get("/admin/users", { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload),
  blockUser: (id) => api.put(`/admin/users/${id}/block`, { isBlocked: true }),
  unblockUser: (id) => api.put(`/admin/users/${id}/block`, { isBlocked: false }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default adminService;
