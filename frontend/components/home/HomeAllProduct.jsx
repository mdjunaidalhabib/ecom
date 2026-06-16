"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "../skeletons/ProductCardSkeleton";
import { apiFetch } from "../../utils/api";
import { motion } from "framer-motion";
import Image from "next/image";
import OfferBadges from "./OfferBadges";

export default function CategoryTabsSection() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState(null);
  const [error, setError] = useState(false);

  /* ================= DRAG SCROLL STATE ================= */
  const scrollRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef(null);

  /* ================= DATA FETCH ================= */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(false);

      const [pRes, cRes] = await Promise.all([
        apiFetch("/products"),
        apiFetch("/categories"),
      ]);

      let pArr = Array.isArray(pRes) ? pRes : [];
      let cArr = Array.isArray(cRes) ? cRes : [];

      // ✅ only active categories + serial sort
      cArr = cArr.filter((c) => c.isActive !== false);
      cArr.sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));

      // ✅ ✅ ✅ PRODUCT SERIAL SORT (order ASC)
      // tie হলে newer first
      pArr.sort((a, b) => {
        const ao = Number(a.order ?? 0);
        const bo = Number(b.order ?? 0);
        if (ao !== bo) return ao - bo;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setProducts(pArr);
      setCategories(cArr);

      if (activeCat && !cArr.find((c) => String(c._id) === String(activeCat))) {
        setActiveCat(null);
      }

      setLoading(false);
    } catch (err) {
      console.log("Error fetching data:", err);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ filter + keep serial order stable
  const filtered = useMemo(() => {
    const base = !activeCat
      ? products
      : products.filter((p) => String(p.category?._id) === String(activeCat));

    // ensure sorted (in case API order changes later)
    return [...base].sort((a, b) => {
      const ao = Number(a.order ?? 0);
      const bo = Number(b.order ?? 0);
      if (ao !== bo) return ao - bo;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [activeCat, products]);

  const shouldShowSkeleton =
    loading || (!error && (products.length === 0 || categories.length === 0));

  const startInertia = () => {
    const el = scrollRef.current;
    if (!el) return;

    const step = () => {
      velocityRef.current *= 0.95;
      if (Math.abs(velocityRef.current) < 0.5) return;

      el.scrollLeft -= velocityRef.current;
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  };

  const onMouseDown = (e) => {
    if (window.innerWidth < 640) return;
    isDownRef.current = true;
    scrollRef.current.classList.add("cursor-grabbing");
    startXRef.current = e.pageX;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
    velocityRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const onMouseMove = (e) => {
    if (!isDownRef.current) return;
    e.preventDefault();
    const dx = e.pageX - startXRef.current;
    const walk = dx * 1.1;
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    velocityRef.current = walk;
  };

  const stopDrag = () => {
    if (!isDownRef.current) return;
    isDownRef.current = false;
    scrollRef.current.classList.remove("cursor-grabbing");
    startInertia();
  };

  /* ================= ERROR UI ================= */
  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-gray-500 text-sm mb-4 text-center">
          ডেটা লোড করা যায়নি। ইন্টারনেট বা সার্ভার সমস্যা হতে পারে।
        </p>
        <button
          type="button"
          onClick={fetchData}
          className="px-4 py-2 rounded-md text-sm font-medium
            bg-gradient-to-r from-blue-600 to-purple-600
            text-white hover:opacity-90 transition"
        >
          🔄 আবার চেষ্টা করুন।
        </button>
      </div>
    );
  }

if (loading || products.length === 0) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 py-10">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

  /* ================= UI ================= */
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-8 "
    >
      {/* ================= CATEGORY TABS ================= */}
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        className="
          w-full
          overflow-x-auto overflow-y-hidden
          [&::-webkit-scrollbar]:hidden scrollbar-none
          sm:cursor-grab
          select-none
        "
      >
        <div
          className="
            /* 📱 MOBILE */
            grid grid-rows-2 grid-flow-col gap-2 auto-cols-[5rem]

            /* 🖥 DESKTOP */
            sm:flex sm:flex-wrap sm:justify-center sm:gap-2
          "
        >
          {categories.map((cat) => (
            <button
              type="button"
              key={cat._id}
              onClick={() =>
                setActiveCat((prev) => (prev === cat._id ? null : cat._id))
              }
              className={`flex-none flex flex-col items-center justify-center
      px-2 py-1 rounded-xl transition-all duration-300
      border shadow-sm hover:shadow-md
      min-w-[65px]
      ${
        activeCat === cat._id
          ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white border-blue-600 scale-105"
          : "bg-orange-100 hover:bg-orange-200 border-orange-300"
      }`}
            >
              <div className="relative w-10 h-10 overflow-hidden rounded-lg border border-gray-300 m bg-white">
                <Image
                  src={cat.image || "/no-image.png"}
                  alt={cat.name}
                  fill
                  sizes="48px"
                  loading="lazy"
                  className="object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>

              <span className="text-sm text-[11px] font-medium text-center truncate w-full max-w-[150px]">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <OfferBadges />
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {filtered.map((prod, i) => (
            <ProductCard key={prod._id} product={prod} priority={i < 5} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">
          কোনো প্রোডাক্ট পাওয়া যায়নি।
        </p>
      )}
    </motion.section>
  );
}