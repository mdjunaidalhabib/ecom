"use client";

import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
      <h1 className="text-8xl font-bold text-red-600">500</h1>

      <p className="text-2xl mt-4 text-gray-700">সার্ভারে কিছু সমস্যা হয়েছে!</p>

      {error?.message && (
        <p className="text-gray-500 mt-2">এরর মেসেজ: {error.message}</p>
      )}

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 text-white bg-yellow-600 rounded-lg shadow hover:bg-yellow-700 transition"
        >
          আবার চেষ্টা করুন
        </button>

        <Link
          href="/"
          className="px-6 py-3 text-white bg-red-600 rounded-lg shadow hover:bg-red-700 transition"
        >
          হোমে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
