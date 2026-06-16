"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ✅ Debounce Hook */
const useDebouncedValue = (value, delay = 400) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

/* ✅ Animations */
const panelVariants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
  exit: { y: "100%" },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

/* ✅ Product Card */
const ProductCard = ({ product, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 transition text-left"
  >
    <img
      src={product.image || product.images?.[0] || "/placeholder.png"}
      alt={product.name}
      className="w-10 h-10 rounded-lg object-cover border bg-white"
    />

    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-800 truncate">
        {product.name}
      </p>
    </div>
  </button>
);

export default function SearchBox({ mobileSearchOpen, setMobileSearchOpen }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(query);
  const ref = useRef(null);

  /* ✅ Navigate */
  const goToProduct = useCallback(
    (id) => {
      setQuery("");
      setResults([]);
      setMobileSearchOpen(false);
      router.push(`/products/${id}`);
    },
    [router, setMobileSearchOpen]
  );

  /* ✅ Fetch Search Results */
  useEffect(() => {
    const q = debouncedQuery.trim();

    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const BASE_URL = "/api";

    setLoading(true);

    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/products`);
        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();
        const products = Array.isArray(data) ? data : data.products || [];

        const filtered = products.filter((p) =>
          p.name?.toLowerCase().includes(q.toLowerCase())
        );

        if (!cancelled) setResults(filtered.slice(0, 20));
      } catch (err) {
        console.error(err);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  return (
    <>
      {/* 🖥 Desktop Search */}
      <div className="hidden md:block relative" ref={ref}>
        <input
          type="text"
          placeholder="Search products..."
          className="rounded-lg px-3 py-1 w-64 border border-orange-300 focus:outline-none focus:border-orange-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute mt-1 w-64 bg-orange-50 shadow rounded-xl px-3 py-2 text-gray-500"
            >
              Searching...
            </motion.div>
          )}

          {!loading && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute mt-1 w-64 bg-orange-50 shadow-xl rounded-xl max-h-72 overflow-y-auto p-2"
            >
              {results.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onClick={() => goToProduct(p._id)}
                />
              ))}
            </motion.div>
          )}

          {!loading && debouncedQuery && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute mt-1 w-64 bg-orange-50 shadow rounded-xl px-3 py-2 text-gray-500"
            >
              No results found
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 📱 Mobile Search */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileSearchOpen(false)}
            />

            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-orange-50 z-50 flex flex-col"
            >
              <div className="flex items-center p-4 border-b bg-orange-50">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search products..."
                  className="flex-1 border border-orange-300 rounded-lg px-3 py-2 focus:outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  onClick={() => setMobileSearchOpen(false)}
                  className="ml-3 p-2"
                >
                  <X className="w-6 h-6 text-rose-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {loading ? (
                  <p className="text-gray-500">Searching...</p>
                ) : results.length ? (
                  results.map((p) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      onClick={() => goToProduct(p._id)}
                    />
                  ))
                ) : debouncedQuery ? (
                  <p className="text-gray-500">No results found</p>
                ) : (
                  <p className="text-gray-400">Type to search products...</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
