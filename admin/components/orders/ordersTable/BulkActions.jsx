"use client";
import { useState } from "react";
import { STATUS_OPTIONS, STATUS_LABEL, STATUS_FLOW } from "../shared/constants";
import Toast from "../../Toast";

export default function BulkActions({
  selected,
  selectedOrders,
  sameStatus,
  bulkStatus,
  canBulkSendCourier,
  onStatusChange,
  onBulkStatusChange,
  onSendCourier,
  onBulkSendCourier,
  onBulkDelete,
  setSelected,
}) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
  };

  const allowedNext = STATUS_FLOW[bulkStatus] || [];
  const disabled = selected.length === 0;

  return (
    <>
      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* BULK BAR (ALWAYS VISIBLE) */}
      <div className="flex items-center gap-2 bg-gray-50 border rounded-full px-3 py-1.5 shadow-sm mr-2">
        {/* SELECTED COUNT */}
        <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">
          {selected.length} Selected
        </span>

        {/* BULK STATUS (ALWAYS RENDER, SOMETIMES DISABLED) */}
        {sameStatus && bulkStatus && (
          <select
            className="rounded-full px-2 py-1 text-xs bg-white border"
            value={bulkStatus}
            disabled={disabled}
            onChange={async (e) => {
              const nextStatus = e.target.value;

              if (!allowedNext.includes(nextStatus)) {
                showToast("এই status এ bulk update করা যাবে না");
                return;
              }

              try {
                // 🚚 SEND TO COURIER (SPECIAL CASE)
                if (nextStatus === "send_to_courier") {
                  if (selected.length === 1) {
                    await onSendCourier(selectedOrders[0]);
                  } else {
                    await onBulkSendCourier(selectedOrders);
                  }

                  showToast("Courier order তৈরি হয়েছে", "success");
                  return;
                }

                // 🔁 NORMAL STATUS UPDATE
                if (selected.length === 1) {
                  await onStatusChange(selected[0], { status: nextStatus });
                } else {
                  await onBulkStatusChange(selected, { status: nextStatus });
                }

                showToast("Status update হয়েছে", "success");
              } finally {
                setSelected([]);
              }
            }}
          >
            <option value={bulkStatus} disabled>
              {STATUS_LABEL[bulkStatus]}
            </option>

            {STATUS_OPTIONS.filter((s) => allowedNext.includes(s)).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        )}

        {/* BULK DELETE (ALWAYS VISIBLE, DISABLED WHEN NO SELECT) */}
        <button
          disabled={disabled}
          onClick={() => {
            if (!selected.length) {
              showToast("Delete করার জন্য কোনো order select করা হয়নি");
              return;
            }

            onBulkDelete(selected);
            setSelected([]);
            showToast("Order delete হয়েছে", "success");
          }}
          className={`px-3 py-1 rounded-full text-xs text-white ${
            disabled
              ? "bg-red-300 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          Delete
        </button>
      </div>
    </>
  );
}
