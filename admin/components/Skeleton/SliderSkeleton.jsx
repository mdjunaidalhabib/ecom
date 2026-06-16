"use client";

export default function SliderPanelSkeleton({ count = 8 }) {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 bg-white rounded-xl p-3 shadow-sm flex flex-col h-full animate-pulse"
        >
          {/* ✅ image skeleton (1500x500 ratio) */}
          <div className="aspect-[3/1] bg-gray-200 rounded-lg" />

          {/* body */}
          <div className="flex flex-col flex-1 mt-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-full" />

            <div className="flex justify-between items-center mt-2">
              <div className="h-5 bg-gray-200 rounded w-20" />
              <div className="h-5 bg-gray-200 rounded w-16" />
            </div>

            {/* actions bottom */}
            <div className="mt-auto pt-3 flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-full" />
              <div className="h-8 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
