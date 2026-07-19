import api from "./api";

const orderService = {
  getMyOrders: (params) => api.get("/orders/my-orders", { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
};

export default orderService;
