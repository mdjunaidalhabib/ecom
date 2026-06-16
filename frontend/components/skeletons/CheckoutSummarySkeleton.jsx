export default function CheckoutSummarySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border p-3 rounded-lg animate-pulse bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 rounded-md bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
              <div className="h-3 w-12 bg-gray-200 rounded ml-auto" />
            </div>
          </div>
        </div>
      ))}

      <div className="border rounded-lg p-4 animate-pulse">
        <div className="h-4 w-full bg-gray-200 rounded mb-3" />
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="mt-4 h-10 w-full bg-gray-200 rounded" />
      </div>
    </div>
  );
}
