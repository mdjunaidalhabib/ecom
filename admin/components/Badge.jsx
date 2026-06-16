export default function Badge({ children, type }) {
  const base =
    "inline-flex items-center justify-center rounded-full px-2 sm:py-0.5 text-[10px] font-bold border whitespace-nowrap w-fit uppercase tracking-tighter";

  const colors = {
    pending: "border-yellow-200 text-yellow-700 bg-yellow-50",
    ready_to_delivery: "border-blue-200 text-blue-700 bg-blue-50",
    send_to_courier: "border-purple-200 text-purple-700 bg-purple-50",
    delivered: "border-green-200 text-green-700 bg-green-50",
    cancelled: "border-red-200 text-red-700 bg-red-50",
  };

  return (
    <span
      className={`${base} ${
        colors[type] || "border-gray-300 text-gray-700 bg-gray-50"
      }`}
    >
      {children}
    </span>
  );
}
