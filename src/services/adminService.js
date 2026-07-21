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

  // Seller verification
  getSellers: (params) => api.get("/admin/sellers", { params }),
  getPendingSellers: (params) => api.get("/admin/sellers/pending", { params }),
  getSeller: (id) => api.get(`/admin/sellers/${id}`),
  approveSeller: (id) => api.put(`/admin/sellers/${id}/approve`),
  rejectSeller: (id, reason) => api.put(`/admin/sellers/${id}/reject`, { reason }),
  // No separate unblock endpoint was specified — reused with a `blocked` flag so the
  // backend can toggle either direction from the same route.
  blockSeller: (id) => api.put(`/admin/sellers/${id}/block`, { blocked: true }),
  unblockSeller: (id) => api.put(`/admin/sellers/${id}/block`, { blocked: false }),

  // User management
  getUsers: (params) => api.get("/admin/users", { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload),
  blockUser: (id) => api.put(`/admin/users/${id}/block`, { blocked: true }),
  unblockUser: (id) => api.put(`/admin/users/${id}/block`, { blocked: false }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default adminService;
