"use client";
import React from "react";

export default function ImageSliderSkeleton({
  ratioClass = "h-56 sm:h-72 md:h-96",
  showDots = true,
}) {
  return (
    <section className="relative container mx-auto py-4 sm:px-6 lg:px-8">
      {/* main skeleton box */}
      <div
        className={`relative w-full ${ratioClass} bg-gray-200 rounded-2xl overflow-hidden`}
      >
        {/* shimmer overlay */}
        <div className="absolute inset-0 shimmer" />
      </div>

      {showDots && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="relative h-2.5 w-6 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
          <div className="relative h-2.5 w-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
          <div className="relative h-2.5 w-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
        </div>
      )}

      {/* ✅ shimmer styles */}
      <style jsx>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: translateX(-100%);
          animation: shimmer 1.6s infinite;
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
}
