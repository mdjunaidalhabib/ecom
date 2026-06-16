"use client";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
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

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 shimmer h-20"></div>
        ))}
      </div>

      {/* Top Products Skeleton */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <div className="w-1/3 h-5 shimmer rounded"></div>
        <div className="w-full h-32 shimmer rounded"></div>
      </div>

      {/* Monthly Sales Skeleton */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <div className="w-1/2 h-5 shimmer rounded"></div>
        <div className="w-full h-64 shimmer rounded"></div>
      </div>
    </div>
  );
}
