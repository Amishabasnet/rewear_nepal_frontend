import api from "./api";

const adminService = {
  getDashboard: () => api.get("/admin/dashboard"),

  getStats: () => api.get("/admin/stats"),

  getRecentOrders: (params) => api.get("/admin/recent-orders", { params }),
};

export default adminService;
