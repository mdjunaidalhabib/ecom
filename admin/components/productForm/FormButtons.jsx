"use client";

export default function FormButtons({
  processing,
  filesReady,
  product,
  onClose,
}) {
  const disabled = processing || !filesReady;

  return (
    <div className="space-y-2">
      <button
        type="submit"
        disabled={disabled}
        className={`w-full py-3 rounded-xl text-white ${
          disabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
        }`}
      >
        {processing
          ? "Saving..."
          : !filesReady
          ? "Uploading Images..."
          : product
          ? "💾 Update Product"
          : "💾 Save Product"}
      </button>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-2 bg-gray-100 rounded-xl"
      >
        Cancel
      </button>
    </div>
  );
}
