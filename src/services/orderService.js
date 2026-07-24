import api from "./api";

const orderService = {
  createOrder: (payload) => api.post("/orders", payload),
  getMyOrders: (params) => api.get("/orders/my-orders", { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
};

export default orderService;