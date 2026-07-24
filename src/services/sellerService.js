import api from "./api";

const sellerService = {
  getProducts: (params) => api.get("/products/mine", { params }),
  getProduct: (id) => api.get(`/products/mine/${id}`),
  createProduct: (payload) =>
    api.post("/products", payload, { headers: { "Content-Type": undefined } }),
  updateProduct: (id, payload) =>
    api.put(`/products/${id}`, payload, { headers: { "Content-Type": undefined } }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getOrders: (params) => api.get("/orders/my-sales", { params }),
};

export default sellerService;
