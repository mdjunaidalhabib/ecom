"use client";

export default function AdminProfileSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white shadow rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 sm:items-center sm:justify-start sm:gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gray-200 shrink-0" />

          {/* Desktop text block */}
          <div className="hidden sm:block flex-1 text-center">
            <div className="h-6 w-48 bg-gray-200 rounded mx-auto" />
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto mt-2" />
            <div className="mt-3 flex gap-2 justify-center">
              <div className="h-5 w-28 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Mobile badges */}
          <div className="flex flex-col items-end gap-1 sm:hidden">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-14 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Mobile name/email */}
        <div className="mt-3 sm:hidden text-center">
          <div className="h-5 w-40 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-52 bg-gray-200 rounded mx-auto mt-2" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mt-6 flex gap-2">
        <div className="h-9 w-24 bg-gray-200 rounded-xl" />
        <div className="h-9 w-28 bg-gray-200 rounded-xl" />
        <div className="h-9 w-36 bg-gray-200 rounded-xl" />
      </div>

      {/* Body Skeleton */}
      <div className="mt-4 bg-white shadow rounded-2xl p-6">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
