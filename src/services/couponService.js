import api from "./api";

const couponService = {
  applyCoupon: (code, subtotal) => api.post("/coupons/apply", { code, subtotal }),
};

export default couponService;
