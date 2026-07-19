import api from "./api";

const productService = {
  getRecommended: () => api.get("/products", { params: { recommended: true } }),
  getAll: (params) => api.get("/products", { params }),
};

export default productService;
