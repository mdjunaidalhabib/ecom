// components/skeletons/FooterSkeleton.jsx
"use client";
import React from "react";

export default function FooterSkeleton() {
  return (
    <footer className="bg-gray-900 text-gray-200 pt-10 pb-6 px-6 md:px-12">
      <div className="max-w-7xl mx-auto animate-pulse grid grid-cols-1 md:grid-cols-4 gap-10">
        {[1, 2, 3, 4].map((col) => (
          <div key={col} className="space-y-4">
            <div className="h-6 w-32 bg-gray-700 rounded"></div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 w-full bg-gray-800 rounded"
                  style={{ opacity: 0.7 }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <hr className="border-t border-gray-700 mt-6" />
      <div className="text-center mt-4">
        <div className="h-4 w-1/2 mx-auto bg-gray-700 rounded"></div>
      </div>
    </footer>
  );
}
