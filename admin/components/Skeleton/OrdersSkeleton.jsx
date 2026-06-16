"use client";

export default function OrdersSkeleton() {
  return (
    <div className="space-y-5">
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -450px 0;
          }
          100% {
            background-position: 450px 0;
          }
        }
        .shimmer {
          background: linear-gradient(
            to right,
            #f0f0f0 8%,
            #ffffff 18%,
            #f0f0f0 33%
          );
          background-size: 800px 104px;
          animation: shimmer 1.3s linear infinite;
        }
      `}</style>

      {/* 🔹 Mobile Grid Skeleton */}
      <div className="grid gap-4 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="w-24 h-3 shimmer rounded"></div>
              <div className="w-16 h-5 shimmer rounded"></div>
            </div>

            {/* Customer Info */}
            <div className="mt-3 space-y-2">
              <div className="w-32 h-4 shimmer rounded"></div>
              <div className="w-24 h-3 shimmer rounded"></div>
              <div className="w-40 h-3 shimmer rounded"></div>
            </div>

            {/* Items */}
            <div className="mt-4 space-y-1">
              <div className="w-20 h-3 shimmer rounded"></div>
              <div className="w-48 h-3 shimmer rounded"></div>
              <div className="w-36 h-3 shimmer rounded"></div>
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-1">
              <div className="w-24 h-3 shimmer rounded"></div>
              <div className="w-32 h-3 shimmer rounded"></div>
              <div className="w-28 h-3 shimmer rounded"></div>
            </div>

            {/* Buttons */}
            <div className="mt-4 flex gap-3">
              <div className="w-20 h-7 shimmer rounded-lg"></div>
              <div className="w-20 h-7 shimmer rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Desktop Table Skeleton */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["Order", "Customer", "Items", "Totals", "Payment", "Status", "Actions"].map(
                (h) => (
                  <th key={h} className="text-left p-3 font-medium text-gray-600">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-gray-100">
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="p-3 align-top">
                    <div className="w-full h-4 shimmer rounded mb-2"></div>
                    <div className="w-2/3 h-3 shimmer rounded"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
