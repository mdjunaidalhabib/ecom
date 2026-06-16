"use client";
import { useCart } from "../context/CartContext";

export function useCartUtils() {
  const {
    cart,
    setCart,
    wishlist,
    setWishlist,
    removeFromCart,
    updateCart: contextUpdateCart,
    toggleWishlist: contextToggleWishlist,
  } = useCart();

  // ✅ Helper: normalize key (supports productId|color)
  const normalizeCartKey = (id) => {
    if (id === null || id === undefined) return "";
    return String(id);
  };

  const updateCart = (id, change = 1, thirdArg = false) => {
    const key = normalizeCartKey(id);
    if (!key) return;

    // ✅ If thirdArg is a number => treat as stock limit (legacy support)
    if (typeof thirdArg === "number") {
      const stockLimit = thirdArg;

      // ✅ Now handled by contextUpdateCart directly (keeps uniqueCount consistent)
      contextUpdateCart(key, change, stockLimit, false);
      return;
    }

    // ✅ Otherwise thirdArg is boolean => isFromAddButton
    const isFromAddButton = !!thirdArg;

    // ✅ contextUpdateCart signature: (id, change, stockLimit, isFromAddButton)
    contextUpdateCart(key, change, Infinity, isFromAddButton);
  };

  /**
   * ✅ Wishlist toggle (consistent everywhere)
   * - always uses string id
   * - uses setWishlist if available, fallback to contextToggleWishlist
   */
  const toggleWishlist = (id) => {
    const wishId = String(id);

    if (typeof setWishlist === "function") {
      setWishlist((prev) =>
        prev.includes(wishId)
          ? prev.filter((x) => x !== wishId)
          : [...prev, wishId]
      );
      return;
    }

    // fallback
    contextToggleWishlist(wishId);
  };

  // 💰 Subtotal calculation (unchanged)
  const calcSubtotal = (items) =>
    items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return {
    cart,
    setCart,
    wishlist,
    setWishlist,
    removeFromCart,
    updateCart, // (id, change, isFromAddButton OR stockNumber)
    toggleWishlist,
    calcSubtotal,
  };
}
