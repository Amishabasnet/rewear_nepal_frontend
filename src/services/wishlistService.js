import api from "./api";

const wishlistService = {
  getWishlist: () => api.get("/wishlist"),
};

export default wishlistService;
