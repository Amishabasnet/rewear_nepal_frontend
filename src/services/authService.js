import api from "./api";

const authService = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
  verifyMfa: (payload) => api.post("/auth/mfa/verify", payload),
  setupMfa: () => api.post("/auth/mfa/setup"),
  confirmMfaSetup: (payload) => api.post("/auth/mfa/setup/confirm", payload),
  disableMfa: (payload) => api.post("/auth/mfa/disable", payload),
};

export default authService;