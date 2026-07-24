import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import cartService from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

function unwrapCart(data) {
  // Backend may respond as { data: { items: [...] } } or { items: [...] } directly
  if (!data) return { items: [] };
  if (Array.isArray(data.items)) return data;
  if (data.data && Array.isArray(data.data.items)) return data.data;
  return { items: [] };
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await cartService.getCart();
      setCart(unwrapCart(res.data));
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh whenever auth state changes (login/logout)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const res = await cartService.addToCart(productId, quantity);
    setCart(unwrapCart(res.data));
    // Some backends return only a success message instead of the full cart —
    // fall back to a fresh fetch so the count/items are always accurate.
    if (!Array.isArray(res.data?.items) && !Array.isArray(res.data?.data?.items)) {
      await refreshCart();
    }
    return res;
  }, [refreshCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    const res = await cartService.updateCartItem(productId, quantity);
    setCart(unwrapCart(res.data));
    if (!Array.isArray(res.data?.items) && !Array.isArray(res.data?.data?.items)) {
      await refreshCart();
    }
    return res;
  }, [refreshCart]);

  const removeItem = useCallback(async (productId) => {
    try {
      const res = await cartService.removeCartItem(productId);
      setCart(unwrapCart(res.data));
      if (!Array.isArray(res.data?.items) && !Array.isArray(res.data?.data?.items)) {
        await refreshCart();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not remove this item");
      throw err;
    }
  }, [refreshCart]);

  const clearCart = useCallback(async () => {
    await cartService.clearCart();
    setCart({ items: [] });
  }, []);

  const itemCount = useMemo(
    () => (cart.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0),
    [cart.items]
  );

  const value = {
    cart,
    items: cart.items || [],
    itemCount,
    loading,
    refreshCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
