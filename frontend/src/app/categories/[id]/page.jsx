"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductCard from "../../../../components/home/ProductCard";
import { apiFetch } from "../../../../utils/api";

export default function CategoryPage() {
  const { id } = useParams(); // 🔥 URL থেকে categoryId আসবে
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch category info + products
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          apiFetch(`/api/categories`),
          apiFetch(`/api/products/category/${id}`),
        ]);

        const cat = Array.isArray(catRes)
          ? catRes.find((c) => String(c._id) === String(id))
          : null;

        setCategory(cat || null);
        setProducts(prodRes || []);
      } catch (err) {
        console.error("❌ Failed to fetch category page data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold mb-6">Loading...</h2>
        <p className="text-gray-500">Please wait while we load products...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold mb-6">Category not found ❌</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        {category.image && (
          <img
            src={category.image}   // ✅ Cloudinary full URL
            alt={category.name}
            className="w-16 h-16 rounded-lg object-cover border"
          />
        )}
        <h2 className="text-2xl font-bold">{category.name}</h2>
      </div>

      {/* Products */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No products found in this category.</p>
      )}
    </div>
  );
}
