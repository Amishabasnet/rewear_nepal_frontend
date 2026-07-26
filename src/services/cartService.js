import api from "./api";

const cartService = {
  getCart: () => api.get("/cart"),
  addToCart: (productId, quantity = 1) => api.post("/cart", { productId, quantity }),
  updateCartItem: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  removeCartItem: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete("/cart"),
};

export default cartService;
