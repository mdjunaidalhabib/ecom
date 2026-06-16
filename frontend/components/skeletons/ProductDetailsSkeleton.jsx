"use client";
import React from "react";

export default function ProductDetailsSkeleton() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-6"></div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gallery Skeleton */}
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="w-full h-[320px] sm:h-[420px] md:h-[480px] bg-gray-200 rounded-xl mb-3"></div>
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Summary Skeleton */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 space-y-4">
          <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>

          {/* Colors Skeleton */}
          <div className="flex gap-2 flex-wrap mt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-16 h-6 bg-gray-200 rounded-lg"></div>
            ))}
          </div>

          {/* Rating Skeleton */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded-full"></div>
              ))}
            </div>
            <div className="h-4 w-10 bg-gray-200 rounded ml-2"></div>
          </div>

          {/* Price Skeleton */}
          <div className="flex items-center justify-between mt-2">
            <div className="h-6 w-20 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>

          {/* Add to Cart + Checkout Skeleton */}
          <div className="flex flex-wrap md:flex-nowrap gap-4 mt-4">
            <div className="flex-1 md:flex-[2] h-10 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </section>

      {/* Tabs Skeleton */}
      <section className="mt-8 space-y-2">
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="mt-4 bg-white rounded-2xl shadow p-4 sm:p-6 space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </section>

      {/* Related Products Skeleton */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </section>
    </main>
  );
}
