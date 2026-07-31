import api from "./api";

const addressService = {
  getAddresses: () => api.get("/addresses"),
  addAddress: (payload) => api.post("/addresses", payload),
  updateAddress: (id, payload) => api.put(`/addresses/${id}`, payload),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/addresses/${id}/default`),
};

export default addressService;
