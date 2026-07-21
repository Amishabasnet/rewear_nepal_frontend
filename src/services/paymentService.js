import api from "./api";

const paymentService = {
  createPayment: (payload) => api.post("/payments/create", payload),
};

export default paymentService;
