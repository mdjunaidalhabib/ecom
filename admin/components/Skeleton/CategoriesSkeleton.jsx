"use client";

export default function CategoriesSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 bg-white rounded-xl p-4 shadow-sm flex flex-col items-center space-y-3"
        >
          <div className="w-24 h-24 shimmer rounded-full"></div>
          <div className="w-1/2 h-4 shimmer rounded"></div>
          <div className="w-32 h-7 shimmer rounded"></div>
        </div>
      ))}
    </div>
  );
}
