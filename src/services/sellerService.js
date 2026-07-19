import api from "./api";

const sellerService = {
  register: (formData) =>
    api.post("/sellers/register", formData, {
      headers: { "Content-Type": undefined },
    }),

  getProfile: () => api.get("/sellers/profile"),
  getProducts: (params) => api.get("/sellers/products", { params }),
  createProduct: (payload) => api.post("/sellers/products", payload),
  updateProduct: (id, payload) => api.put(`/sellers/products/${id}`, payload),
  deleteProduct: (id) => api.delete(`/sellers/products/${id}`),
  getOrders: (params) => api.get("/sellers/orders", { params }),
  getDashboard: () => api.get("/sellers/dashboard"),
};

export default sellerService;
