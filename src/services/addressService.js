import api from "./api";

const addressService = {
  getAddresses: () => api.get("/addresses"),
  addAddress: (payload) => api.post("/addresses", payload),
};

export default addressService;
