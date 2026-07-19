import api from "./api";

const cartService = {
  getCart: () => api.get("/cart"),
};

export default cartService;
