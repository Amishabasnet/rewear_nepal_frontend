import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  // Cookie holds the token, not JS — this just tells the browser to send it.
  withCredentials: true,
});

// Access token expires after 15 min. If a request gets a 401, we quietly
// swap it for a new one using the refresh cookie, then retry once.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = config?.url?.includes("/auth/login") || config?.url?.includes("/auth/refresh");

    if (response?.status === 401 && !config._retried && !isAuthEndpoint) {
      config._retried = true;
      try {
        // Don't fire off a separate refresh for every request that fails
        // at once — just reuse the one already in flight.
        refreshPromise = refreshPromise || api.post("/auth/refresh");
        await refreshPromise;
        return api(config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);

export default api;