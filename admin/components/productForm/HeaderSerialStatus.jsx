"use client";

import { useEffect } from "react";

export default function HeaderSerialStatus({
  product,
  form,
  setForm,
  maxSerial, // সাধারণত productsLength
}) {
  const safeMax = Number(maxSerial ?? 0);

  // ✅ new product -> default serial = last (max+1)
  // ✅ edit product -> keep existing serial
  useEffect(() => {
    if (!product) {
      const last = safeMax + 1;

      // শুধু তখনই সেট করবে যখন order নেই/invalid বা last থেকে বড়/ছোট mismatch
      setForm((p) => {
        const current = Number(p?.order ?? 0);
        if (current >= 1 && current <= last) return p; // already valid
        return { ...p, order: last };
      });
    }
  }, [product, safeMax, setForm]);

  // ✅ options: edit -> max পর্যন্ত, add -> max+1 পর্যন্ত
  const totalOptions = product ? safeMax : safeMax + 1;

  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-indigo-600">
          {product ? "✏ Edit Product" : "🛍 Add Product"}
        </h1>
      </div>

      <div className="bg-gray-50 rounded p-4 grid grid-cols-2 gap-3 mt-4">
        <div>
          <label className="text-sm font-semibold block mb-1">Serial</label>

          <select
            value={Number(form.order ?? safeMax + 1)}
            onChange={(e) =>
              setForm((p) => ({ ...p, order: Number(e.target.value) }))
            }
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none bg-white transition-all"
          >
            {Array.from({ length: totalOptions }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <p className="text-[10px] text-gray-500 mt-1">
            {product ? "Current position" : "Automatically set to last"}
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Status</label>

          <select
            value={form.isActive ? "active" : "hidden"}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                isActive: e.target.value === "active",
              }))
            }
            className={`w-full border p-2.5 rounded-lg focus:ring-2 outline-none transition-all ${
              form.isActive
                ? "border-green-200 bg-green-50 text-green-700 focus:ring-green-100"
                : "border-red-200 bg-red-50 text-red-700 focus:ring-red-100"
            }`}
          >
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>
    </>
  );
}
