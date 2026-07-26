import api from "./api";

const productService = {
  getRecommended: () => api.get("/products", { params: { recommended: true } }),
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  reportProduct: (productId, payload) => api.post(`/products/${productId}/report`, payload),
};

export default productService;
