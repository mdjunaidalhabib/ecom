"use client";

import { useState } from "react";
import { apiFetch } from "../../utils/api";

export default function ReviewModal({ open, onClose, productId, onSuccess }) {
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const data = await apiFetch(`/products/${productId}/review`, {
        method: "POST",
        body: JSON.stringify(form),
      });

      setMsg("✅ Review added!");
      setForm({ rating: 5, comment: "" });
      onSuccess?.(data);

      // ✅ close after success
      setTimeout(() => onClose?.(), 400);
    } catch (err) {
      setMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative w-[92%] max-w-lg rounded-2xl bg-orange-50 shadow-xl border border-orange-200">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-base font-semibold">Write a Review</h3>
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 rounded hover:bg-orange-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Rating</label>
            <select
              value={form.rating}
              onChange={(e) =>
                setForm((p) => ({ ...p, rating: Number(e.target.value) }))
              }
              className="mt-1 bg-orange-50 border rounded-lg px-4 py-2 w-full"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Star
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Comment</label>
            <textarea
              placeholder="Share your experience..."
              value={form.comment}
              onChange={(e) =>
                setForm((p) => ({ ...p, comment: e.target.value }))
              }
              className="mt-1 border rounded-lg px-4 py-2 w-full min-h-[110px]"
              required
            />
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-orange-100 hover:bg-orange-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>

          {msg && <p className="text-sm text-gray-600">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
