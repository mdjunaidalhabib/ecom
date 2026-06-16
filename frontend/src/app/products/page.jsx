"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "../../../components/home/ProductCard";
import ProductGridSkeleton from "../../../components/skeletons/ProductGridSkeleton";
import { apiFetch } from "../../../utils/api";

export default function AllProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    apiFetch("/products")
      .then((data) => {
        if (mounted) setProducts(data || []);
      })
      .catch((err) => {
        console.error("❌ Product fetch error:", err);
        if (mounted) setProducts([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="bg-orange-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">All Products</span>
        </nav>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-semibold mb-6">
          All Products
        </h1>

        {/* Products Section */}
        {loading ? (
          <ProductGridSkeleton count={10} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p>No products available.</p>
          </div>
        )}
      </div>
    </main>
  );
}
