"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import ReviewModal from "./ReviewModal";

export default function AddReviewForm({ productId, onSuccess }) {
  const { me, loadingUser } = useUser();
  const [open, setOpen] = useState(false);

  // ✅ login থেকে redirect হয়ে এলে auto open modal
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("review") === "1") setOpen(true);
  }, []);

  const goLogin = () => {
    const currentUrl = window.location.href;
    window.location.href = `${
      "/api"
    }/auth/google?redirect=${encodeURIComponent(currentUrl)}`;
  };

  const openModal = () => {
    if (loadingUser) return;
    if (!me) return goLogin();
    setOpen(true);
  };

  return (
    <div className="bg-orange-100 border border-orange-200 rounded-2xl p-3 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="font-semibold text-sm text-gray-900">Reviews</p>
          <p className="text-xs md:text-sm text-gray-500">
            আপনার অভিজ্ঞতা শেয়ার করুন ✍️
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          disabled={loadingUser}
          className="bg-orange-500 text-white text-xs md:text-sm px-4 py-1
           rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 w-full md:w-auto"
        >
          {loadingUser
            ? "Loading..."
            : me
            ? "Write a Review"
            : "Login to Review"}
        </button>
      </div>

      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
        productId={productId}
        onSuccess={onSuccess}
      />
    </div>
  );
}
