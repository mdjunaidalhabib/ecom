"use client";

export default function ConfirmModal({ title, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center">
      <div className="bg-white rounded-xl p-4 w-[280px] space-y-3">
        <div className="font-semibold text-center">{title}</div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border rounded py-2 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white rounded py-2 text-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
