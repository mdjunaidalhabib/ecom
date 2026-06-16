"use client";

import { useRef, useEffect, useState } from "react";
import { convertToWebpUnderLimit } from "../utils/imageConvert";

/* ================== ✅ RULE (Dynamic) ================== */
const CATEGORY_IMAGE_RULE = {
  type: "image/webp",
  width: 300,
  height: 300,
  maxBytes: 100 * 1024,
  allowedInputTypes: ["image/webp", "image/jpeg", "image/png"],
  startQuality: 0.88,
  minQuality: 0.3,
  qualityStep: 0.08,
};

export default function CategoryModal({
  show,
  editId,
  categoriesLength = 0,

  name,
  setName,

  order,
  setOrder,

  isActive,
  setIsActive,

  file,
  setFile,

  preview,
  setPreview,

  loading,
  onClose,
  onSubmit,
}) {
  const dropRef = useRef(null);

  // ✅ dropdown limit like slider
  const maxSerial = editId ? categoriesLength : categoriesLength + 1;

  // ✅ image state
  const [imageError, setImageError] = useState("");
  const [filesReady, setFilesReady] = useState(true);

  // ✅ New modal open => last serial + active default
  useEffect(() => {
    if (show && !editId) {
      setOrder(categoriesLength + 1);
      setIsActive(true);
    }
  }, [show, editId, categoriesLength, setOrder, setIsActive]);

  // ✅ Reset image states on open/close
  useEffect(() => {
    if (!show) {
      setImageError("");
      setFilesReady(true);
      return;
    }
    setImageError("");
    setFilesReady(true);
  }, [show]);

  if (!show) return null;

  /* ================== ✅ MAIN FILE PROCESSOR ================== */
  const processFile = async (incomingFile) => {
    if (!incomingFile) return;

    setFilesReady(false);
    setImageError("");

    try {
      const converted = await convertToWebpUnderLimit(
        incomingFile,
        CATEGORY_IMAGE_RULE
      );

      setFile(converted);

      // ✅ preview (revoke old)
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(converted));
    } catch (e) {
      console.error(e);

      setImageError(e?.message || "Invalid image file");
      setFile(null);

      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      setPreview("");
    } finally {
      setFilesReady(true);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    processFile(dropped);
  };

  const maxKB = Math.floor(CATEGORY_IMAGE_RULE.maxBytes / 1024);

  return (
    <>
      <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40" />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-center">
            {editId ? "✏️ Edit Category" : "➕ Add Category"}
          </h2>

          <form onSubmit={onSubmit} className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Category Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                className="border w-full p-2 rounded"
                required
              />
            </div>

            {/* ✅ Serial + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Serial No
                </label>
                <select
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="border w-full p-2 rounded bg-white"
                >
                  {Array.from({ length: maxSerial }, (_, i) => i + 1).map(
                    (num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={isActive ? "active" : "hidden"}
                  onChange={(e) => setIsActive(e.target.value === "active")}
                  className="border w-full p-2 rounded bg-white"
                >
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>

            {/* Image uploader */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Category Image{" "}
                <span className="text-[11px] text-gray-500 font-semibold">
                  (jpeg/png/webp → Auto WEBP, {CATEGORY_IMAGE_RULE.width}×
                  {CATEGORY_IMAGE_RULE.height}, max {maxKB}KB)
                </span>
              </label>

              <div
                ref={dropRef}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`border-2 border-dashed h-32 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer bg-gray-50 ${
                  imageError ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                onClick={() =>
                  dropRef.current?.querySelector("input[type=file]")?.click()
                }
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gray-500">
                    Drag & drop or click to upload
                  </span>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    processFile(f);
                  }}
                />
              </div>

              {imageError && (
                <p className="text-[11px] text-red-600 mt-1 font-semibold">
                  {imageError}
                </p>
              )}

              {!filesReady && (
                <p className="text-[11px] text-orange-600 mt-1 font-semibold">
                  Processing image...
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={`px-4 py-2 rounded text-white ${
                  loading || !filesReady || !!imageError
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                disabled={loading || !filesReady || !!imageError}
              >
                {loading ? "Saving..." : editId ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
