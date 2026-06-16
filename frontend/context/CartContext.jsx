"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [uniqueCount, setUniqueCount] = useState(0); // 🔹 আলাদা প্রোডাক্ট সংখ্যা ট্র্যাক

  // ✅ Helper: key normalize (for backward compatibility)
  const normalizeCartKey = (id) => {
    if (id === null || id === undefined) return "";
    return String(id);
  };

  // ✅ Helper: get productId from key (productId|color)
  const getProductIdFromKey = (key) => {
    const [productId] = String(key).split("|");
    return String(productId);
  };

  const updateCart = (
    id,
    change = 1,
    stockLimit = Infinity, // ✅ NEW: stock limit support
    isFromAddButton = false
  ) => {
    const key = normalizeCartKey(id);
    if (!key) return;

    setCart((prev) => {
      const exists = prev[key] || 0;
      let newCart = { ...prev };

      // ✅ শুধু প্রথমবার Add করলে unique count বাড়াবে (key based)
      if (isFromAddButton && !exists) {
        setUniqueCount((prevCount) => prevCount + 1);
      }

      let newQty = exists + change;

      // ✅ stock limit enforce (only when increasing)
      if (change > 0 && Number.isFinite(Number(stockLimit))) {
        newQty = Math.min(newQty, Number(stockLimit));
      }

      // ❌ Quantity শূন্য হলে প্রোডাক্ট রিমুভ করো
      if (newQty <= 0) {
        if (newCart[key]) {
          delete newCart[key];
          setUniqueCount((prevCount) => Math.max(0, prevCount - 1)); // প্রোডাক্ট রিমুভ হলে কাউন্ট কমাও
        }
      }
      // ✅ Quantity থাকলে শুধু আপডেট করো
      else {
        newCart[key] = newQty;
      }

      return newCart;
    });
  };

  const removeFromCart = (id) => {
    const key = normalizeCartKey(id);
    if (!key) return;

    setCart((prev) => {
      const copy = { ...prev };
      if (copy[key]) {
        delete copy[key];
        setUniqueCount((prevCount) => Math.max(0, prevCount - 1)); // 🔹 রিমুভে কাউন্ট কমাও
      }
      return copy;
    });
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      const savedWishlist = localStorage.getItem("wishlist");
      const savedCount = localStorage.getItem("uniqueCount");

      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        // ✅ Ensure cart is object (fix variants.map is not a function type bugs)
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setCart(parsed);

          // ✅ If uniqueCount missing or invalid, recalc safely
          if (!savedCount) {
            setUniqueCount(Object.keys(parsed).length);
          }
        } else {
          setCart({});
          setUniqueCount(0);
        }
      }

      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      if (savedCount) setUniqueCount(Number(savedCount));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      localStorage.setItem("uniqueCount", uniqueCount);
    }
  }, [cart, wishlist, uniqueCount]);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        wishlist,
        uniqueCount, // 🔹 নতুন count পাঠাও
        updateCart,
        removeFromCart,
        toggleWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
