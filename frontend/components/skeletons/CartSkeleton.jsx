"use client";
import React from "react";

export default function CartSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 animate-pulse">
      {/* image placeholder */}
      <div className="w-20 h-20 bg-gray-200 rounded" />

      {/* text placeholder */}
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
