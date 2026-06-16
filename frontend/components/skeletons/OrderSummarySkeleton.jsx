"use client";

function SkeletonLine({ w = "w-full", h = "h-3" }) {
  return <div className={`${h} ${w} bg-gray-200 rounded animate-pulse`} />;
}

export default function OrderSummarySkeleton() {
  return (
    <div className="max-w-sm mx-auto my-4 bg-white shadow rounded-lg divide-y divide-gray-200 text-sm">
      {/* Header */}
      <div className="p-3 text-center space-y-2">
        <div className="mx-auto h-5 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="mx-auto h-3 w-52 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Order Info */}
      <div className="p-3 space-y-2">
        <SkeletonLine w="w-48" />
        <SkeletonLine w="w-56" />
        <div className="flex items-center gap-2">
          <SkeletonLine w="w-20" />
          <div className="h-4 w-20 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Billing */}
      <div className="p-3 space-y-2">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <SkeletonLine w="w-44" />
        <SkeletonLine w="w-40" />
        <SkeletonLine w="w-full" />
        <SkeletonLine w="w-5/6" />
      </div>

      {/* Items */}
      <div className="p-3 space-y-2">
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-1 border rounded-lg text-xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-1">
                <SkeletonLine w="w-28" />
                <SkeletonLine w="w-16" h="h-2.5" />
              </div>
            </div>
            <SkeletonLine w="w-12" />
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="p-3 space-y-2">
        <div className="flex justify-end">
          <SkeletonLine w="w-28" />
        </div>
        <div className="flex justify-end">
          <SkeletonLine w="w-24" />
        </div>
        <div className="flex justify-end">
          <SkeletonLine w="w-20" />
        </div>
        <div className="flex justify-end">
          <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-3">
        <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
        <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
