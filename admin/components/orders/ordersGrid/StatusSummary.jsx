"use client";

import { STATUS_OPTIONS, STATUS_LABEL } from "../shared/constants";

export default function StatusSummary({
  orders,
  tabStatus,
  setTabStatus,
  statusCount,
}) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b px-2 py-2">
      <select
        value={tabStatus}
        onChange={(e) => setTabStatus(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-bold bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {/* 'All' অপশন যা সব অর্ডারের সংখ্যা দেখাবে */}
        <option value="">ALL ({orders.length})</option>

        {/* কনস্ট্যান্ট থেকে সব স্ট্যাটাস অপশনগুলো লুপ করে দেখানো হচ্ছে */}
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}{" "}
            {statusCount?.[s] !== undefined ? `(${statusCount[s]})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
