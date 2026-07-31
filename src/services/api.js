import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  // Cookie holds the token, not JS — this just tells the browser to send it.
  withCredentials: true,
});

// --- CSRF (double-submit cookie) ---
// The backend sets a JS-readable "XSRF-TOKEN" cookie on every response.
// For any state-changing request we echo that value back as a header;
// the server rejects the request if the two don't match. A cross-site
// page can make the browser send the cookie, but can't read it to copy
// into the header, so this stops forged requests without needing us to
// track any server-side session.
const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";
const SAFE_METHODS = new Set(["get", "head", "options"]);

const readCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (!SAFE_METHODS.has(method)) {
    const csrfToken = readCookie(CSRF_COOKIE_NAME);
    if (csrfToken) {
      config.headers[CSRF_HEADER_NAME] = csrfToken;
    }
  }
  return config;
});

// Makes sure the XSRF-TOKEN cookie exists before the user's first
// state-changing request (e.g. register/login as the very first action
// on a fresh visit, before any other GET has hit the API).
export const primeCsrfToken = () => api.get("/security/csrf-token").catch(() => {});

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