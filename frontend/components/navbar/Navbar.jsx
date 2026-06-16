"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { apiFetch } from "../../utils/api";
import { FaHome, FaThLarge, FaSearch, FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import SearchBox from "./SearchBox";
import AccountMenuDesktop from "./AccountMenuDesktop";
import AccountMenuMobile from "./AccountMenuMobile";
import CartIcon from "./CartIcon";
import WishlistIcon from "./WishlistIcon";

const sideMenu = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
  exit: { x: "-100%" },
};
const topBar = { open: { rotate: 45, y: 10 }, closed: { rotate: 0, y: 0 } };
const middleBar = { open: { opacity: 0 }, closed: { opacity: 1 } };
const bottomBar = { open: { rotate: -45, y: -7 }, closed: { rotate: 0, y: 0 } };

export default function Navbar() {
  const [navbar, setNavbar] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [imgError, setImgError] = useState(false);

  const pathname = usePathname();
  const { cart = {}, wishlist = [] } = useCart() || {};
  const cartCount = Object.keys(cart).length;
  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;
  const API_URL = "/api";

  // 🔹 Load user info
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/auth/me");
        setMe(data.user);
      } catch {
        setMe(null);
      } finally {
        setLoadingUser(false);
      }
    })();
  }, []);

  // 🔹 Fetch navbar info
  useEffect(() => {
    const fetchNavbar = async () => {
      try {
        const res = await fetch(`${API_URL}/navbar`);
        const data = await res.json();

        // ✅ ensure brand exists always
        const brand = data?.brand || {};
        if (!("name" in brand)) brand.name = "";
        if (!("logo" in brand)) brand.logo = "";

        setNavbar({ ...data, brand });
      } catch (err) {
        console.error("❌ Failed to load navbar:", err);
      }
    };
    fetchNavbar();
  }, [API_URL]);

  // ✅ logo change হলে imgError reset (Footer-like behavior)
  useEffect(() => {
    setImgError(false);
  }, [navbar?.brand?.logo]);

  // 🔹 ESC close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // 🔹 Disable scroll
  useEffect(() => {
    document.body.style.overflow =
      menuOpen || mobileSearchOpen ? "hidden" : "auto";
  }, [menuOpen, mobileSearchOpen]);

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* 🧭 Top Navbar */}
      <nav className="bg-orange-100 text-gray-800 shadow-md sticky top-0 z-50 ">
        <div className="container mx-auto w-full flex justify-between items-center py-3 px-4 md:px-8">
          {/* 📱 Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-[5px] z-50"
          >
            <motion.span
              variants={topBar}
              animate={menuOpen ? "open" : "closed"}
              transition={{ duration: 0.3 }}
              className="block h-1 w-6 bg-orange-600 rounded"
            />
            <motion.span
              variants={middleBar}
              animate={menuOpen ? "open" : "closed"}
              transition={{ duration: 0.3 }}
              className="block h-1 w-6 bg-orange-600 rounded"
            />
            <motion.span
              variants={bottomBar}
              animate={menuOpen ? "open" : "closed"}
              transition={{ duration: 0.3 }}
              className="block h-1 w-6 bg-orange-600 rounded"
            />
          </button>
          {/* 🏷 Brand (Footer-like UI) */}
          <Link href="/" className="flex items-center gap-3">
            {navbar?.brand?.logo && !imgError ? (
              <img
                src={navbar.brand.logo}
                alt={navbar?.brand?.name || "Brand"}
                className="h-8 w-8 md:h-10 md:w-10 object-cover rounded-lg"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center bg-pink-50 rounded-lg">
                <FaUserCircle className="text-gray-400 w-6 h-6" />
              </div>
            )}

            {navbar?.brand?.name?.trim() ? (
              <span className="text-xl font-bold text-orange-600 block min-w-[100px] truncate">
                {navbar.brand.name.trim()}
              </span>
            ) : (
              <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            )}
          </Link>

          {/* 📱 Mobile Search Icon */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileSearchOpen(true)}
          >
            <FaSearch className="w-5 h-5 text-orange-600" />
          </button>

          {/* 💻 Desktop Menu */}
          <div className="hidden md:flex items-center gap-2 font-medium">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-200 ${
                isActive("/")
                  ? "text-orange-600 bg-orange-300 border border-orange-400 font-medium"
                  : "text-gray-900 hover:text-orange-600 hover:bg-orange-300"
              }`}
            >
              Home
            </Link>

            <Link
              href="/products"
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-200 ${
                isActive("/products")
                  ? "text-orange-600 bg-orange-300 border border-orange-400 font-medium"
                  : "text-gray-900 hover:text-orange-600 hover:bg-orange-300"
              }`}
            >
              All Products
            </Link>

            <Link
              href="/categories"
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-200 ${
                isActive("/categories")
                  ? "text-orange-600 bg-orange-300 border border-orange-400 font-medium"
                  : "text-gray-900 hover:text-orange-600 hover:bg-orange-300"
              }`}
            >
              Shop by Category
            </Link>
          </div>

          {/* 💻 Desktop Actions */}
          <div className="hidden md:flex items-center gap-4 relative">
            <SearchBox
              mobileSearchOpen={mobileSearchOpen}
              setMobileSearchOpen={setMobileSearchOpen}
            />

            {/* ✅ Account Active Only on Profile/Orders */}
            <div
              className={`rounded transition-all duration-200 ${
                pathname.startsWith("/profile") ||
                pathname.startsWith("/orders")
                  ? "text-orange-600 bg-orange-300 border border-orange-400 font-medium"
                  : "text-gray-900 hover:text-orange-600 hover:bg-orange-300"
              }`}
            >
              <AccountMenuDesktop />
            </div>

            <div
              className={`rounded transition-all duration-200 p-2 ${
                pathname === "/cart"
                  ? "text-orange-600 bg-orange-300 border border-orange-400 font-medium"
                  : "text-gray-900 hover:text-orange-600 hover:bg-orange-300"
              }`}
            >
              <CartIcon cartCount={cartCount} />
            </div>

            <div
              className={`rounded transition-all duration-200 p-2 ${
                pathname === "/wishlist"
                  ? "text-orange-600 bg-orange-300 border border-orange-400 font-medium"
                  : "text-gray-900 hover:text-orange-600 hover:bg-orange-300"
              }`}
            >
              <WishlistIcon wishlistCount={wishlistCount} />
            </div>
          </div>
        </div>
      </nav>

      {/* 📱 Mobile Search */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white shadow-inner border-t px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchBox
                mobileSearchOpen={mobileSearchOpen}
                setMobileSearchOpen={setMobileSearchOpen}
              />
            </div>
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 text-gray-600 hover:text-orange-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 📱 Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              variants={sideMenu}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-[60px] left-0 bottom-0 w-56 bg-orange-50 shadow-lg p-3 flex flex-col space-y-2.5 z-50 text-[15px]"
            >
              <Link
                href="/"
                className={`flex items-center gap-2.5 px-3 py-2 rounded transition-all duration-200 ${
                  isActive("/")
                    ? "text-orange-600 bg-orange-200 font-medium"
                    : "text-gray-700 hover:text-orange-600 hover:bg-orange-100"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <FaHome className="w-4 h-4" />
                <span>Home</span>
              </Link>

              <Link
                href="/products"
                className={`flex items-center gap-2.5 px-3 py-2 rounded transition-all duration-200 ${
                  isActive("/products")
                    ? "text-orange-600 bg-orange-200 font-medium"
                    : "text-gray-700 hover:text-orange-600 hover:bg-orange-100"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <FaThLarge className="w-4 h-4" />
                <span>All Products</span>
              </Link>

              <Link
                href="/categories"
                className={`flex items-center gap-2.5 px-3 py-2 rounded transition-all duration-200 ${
                  isActive("/categories")
                    ? "text-orange-600 bg-orange-200 font-medium"
                    : "text-gray-700 hover:text-orange-600 hover:bg-orange-100"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <FaSearch className="w-4 h-4" />
                <span>Shop by Category</span>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 📱 Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-orange-100 shadow-inner border-t border-orange-300 md:hidden z-50">
        <div className="flex justify-around items-center py-2 text-sm">
          <Link
            href="/"
            className={`flex flex-col items-center ${
              isActive("/") ? "text-orange-600" : "text-gray-700"
            }`}
          >
            <FaHome className="w-5 h-5" />
            <span>Home</span>
          </Link>

          <Link
            href="/categories"
            className={`flex flex-col items-center ${
              isActive("/categories") ? "text-orange-600" : "text-gray-700"
            }`}
          >
            <FaThLarge className="w-5 h-5" />
            <span>Category</span>
          </Link>

          <div
            className={
              isActive("/wishlist") ? "text-orange-600" : "text-gray-700"
            }
          >
            <WishlistIcon wishlistCount={wishlistCount} mobile />
          </div>

          <div
            className={isActive("/cart") ? "text-orange-600" : "text-gray-700"}
          >
            <CartIcon cartCount={cartCount} mobile />
          </div>

          <div
            className={`${
              pathname.startsWith("/profile") || pathname.startsWith("/orders")
                ? "text-orange-600"
                : "text-gray-700"
            }`}
          >
            <AccountMenuMobile
              me={me}
              setMe={setMe}
              loadingUser={loadingUser}
            />
          </div>
        </div>
      </div>
    </>
  );
}
