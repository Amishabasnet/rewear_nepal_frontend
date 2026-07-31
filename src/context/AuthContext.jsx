import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // We never store the raw access token in JS-readable storage — it lives
  // only in an httpOnly cookie the browser attaches automatically. All we
  // cache client-side is the (non-sensitive) user profile, purely so the
  // UI has something to render before the bootstrap check below resolves.
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("rewear_user");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem("rewear_user");
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // On mount, always ask the backend who we are — the httpOnly cookie (if
  // any) is sent automatically. This is the source of truth, not whatever
  // happens to be cached in localStorage from a previous visit.
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await authService.getProfile();
        const profile = data.data;
        setUser(profile);
        localStorage.setItem("rewear_user", JSON.stringify(profile));
      } catch {
        localStorage.removeItem("rewear_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const persistSession = (data) => {
    const authUser = data.data;
    localStorage.setItem("rewear_user", JSON.stringify(authUser));
    setUser(authUser);
    return authUser;
  };

  const register = useCallback(async (formData) => {
    const { data } = await authService.register(formData);
    const authUser = persistSession(data);
    toast.success("Account created successfully!");
    return authUser;
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authService.login(credentials);

    // Password was correct, but the account has MFA enabled — no session
    // was issued yet. Hand the mfaToken back to the caller so it can show
    // a "enter your code" step instead of treating this as a full login.
    if (data.mfaRequired) {
      return { mfaRequired: true, mfaToken: data.data.mfaToken };
    }

    const authUser = persistSession(data);
    toast.success(`Welcome back, ${authUser.name?.split(" ")[0] || "there"}!`);
    return authUser;
  }, []);

  const verifyMfa = useCallback(async (mfaToken, code) => {
    const { data } = await authService.verifyMfa({ mfaToken, code });
    const authUser = persistSession(data);
    toast.success(`Welcome back, ${authUser.name?.split(" ")[0] || "there"}!`);
    return authUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clears the httpOnly access-token cookie and revokes the refresh
      // token server-side. Without this, the cookie stays valid and the
      // "logged out" state on this tab would be cosmetic only.
      await authService.logout();
    } catch {
      // Even if the network call fails, still clear local state below —
      // the user asked to log out and the UI should reflect that.
    }
    localStorage.removeItem("rewear_user");
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  const updateUser = useCallback((partialUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...partialUser };
      localStorage.setItem("rewear_user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isBuyer: user?.role === "buyer",
    isAdmin: user?.role === "admin",
    register,
    login,
    verifyMfa,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
