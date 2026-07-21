import api from "./api";

const adminService = {
  // Dashboard payload — totals, pending approvals, reported products, sales chart
  getDashboard: () => api.get("/admin/dashboard"),

  getStats: () => api.get("/admin/stats"),

  // Recent orders table feed
  getRecentOrders: (params) => api.get("/admin/recent-orders", { params }),

  // Product moderation
  getProducts: (params) => api.get("/admin/products", { params }),
  getPendingProducts: (params) => api.get("/admin/products/pending", { params }),
  // product detail page
  getProduct: (id) => api.get(`/admin/products/${id}`),
  approveProduct: (id) => api.put(`/admin/products/${id}/approve`),
  rejectProduct: (id, reason) => api.put(`/admin/products/${id}/reject`, { reason }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
};

export default adminService;
