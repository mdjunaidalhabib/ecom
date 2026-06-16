"use client";

export default function AdminHeaderCardSkeleton() {
  return (
    <div className="bg-white shadow rounded-2xl p-2 animate-pulse">
      {/* top row */}
      <div className="flex items-start justify-between gap-2">
        {/* avatar skeleton */}
        <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />

        {/* role + status skeleton */}
        <div className="flex flex-col items-end gap-1">
          <div className="h-5 w-24 bg-gray-200 rounded-md" />
          <div className="h-5 w-14 bg-gray-200 rounded-md" />
        </div>
      </div>

      {/* bottom row */}
      <div className="mt-2">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-3 w-40 bg-gray-200 rounded mt-1" />
      </div>
    </div>
  );
}
