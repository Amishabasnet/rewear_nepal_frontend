import api from "./api";

const reviewService = {
  getProductReviews: (productId) => api.get(`/products/${productId}/reviews`),
  addReview: (productId, payload) => api.post(`/products/${productId}/reviews`, payload),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

export default reviewService;
