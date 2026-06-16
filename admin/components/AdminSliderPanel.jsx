"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import AddSlideModal from "./AddSlideModal";
import SliderPanelSkeleton from "./Skeleton/SliderSkeleton";

/* ================== ✅ SLIDER IMAGE RULE ================== */
const SLIDER_IMAGE_RULE = {
  type: "image/webp",
  width: 1500,
  height: 500,
  maxBytes: 100 * 1024, // ✅ 100KB
  startQuality: 0.85,
  minQuality: 0.25,
  qualityStep: 0.07,
};

/* ================== ✅ RESIZE HELPER (Dynamic 1500×500 WEBP <= maxBytes) ================== */
async function resizeToWebP_1500x500(
  file,
  width = SLIDER_IMAGE_RULE.width,
  height = SLIDER_IMAGE_RULE.height,
  maxBytes = SLIDER_IMAGE_RULE.maxBytes
) {
  const readAsDataURL = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const toWebP = (canvas, quality) =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Blob creation failed"));
          resolve(blob);
        },
        SLIDER_IMAGE_RULE.type,
        quality
      );
    });

  const dataURL = await readAsDataURL(file);
  const img = await loadImage(dataURL);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // ✅ Cover crop for width × height
  const scale = Math.max(width / img.width, height / img.height);
  const x = (width - img.width * scale) / 2;
  const y = (height - img.height * scale) / 2;
  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

  // ✅ Auto reduce quality until <= maxBytes
  let quality = SLIDER_IMAGE_RULE.startQuality;
  let blob = await toWebP(canvas, quality);

  while (blob.size > maxBytes && quality > SLIDER_IMAGE_RULE.minQuality) {
    quality -= SLIDER_IMAGE_RULE.qualityStep;
    blob = await toWebP(canvas, quality);
  }

  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
    type: SLIDER_IMAGE_RULE.type,
  });
}

export default function AdminSliderPanel() {
  const API_URL = "/api";

  const [slides, setSlides] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  // ✅ FILTER STATE
  const [filter, setFilter] = useState("all");

  // add/edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editSlide, setEditSlide] = useState(null);

  // single delete modal state
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ delete-all modal state
  const [deleteAllModal, setDeleteAllModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // fetch slides
  const fetchSlides = async () => {
    try {
      setPageLoading(true);
      const res = await fetch(`${API_URL}/admin/sliders`, {
        credentials: "include",
      });
      const data = await res.json();
      setSlides(data.slides || []);
    } catch {
      toast.error("❌ Failed to fetch slides");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, [API_URL]);

  // save slide
  const handleSave = async (slideObj) => {
    setSavingId(slideObj._id || "new");

    try {
      const payload = structuredClone(slideObj);
      const formData = new FormData();

      // ✅ imageFile already processed (webp 1500x500 <= maxBytes)
      if (payload.imageFile) {
        formData.append("image", payload.imageFile);
        delete payload.imageFile;
      }

      if (payload.removeImage) {
        formData.append("removeImage", "true");
        delete payload.removeImage;
      }

      formData.append("slide", JSON.stringify(payload));

      const res = await fetch(`${API_URL}/admin/sliders`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Save failed");

      const data = await res.json();
      setSlides(data.slides || []);
      toast.success("✅ Slide saved");

      setShowModal(false);
      setEditSlide(null);
    } catch (e) {
      console.error(e);
      toast.error("❌ Slide save failed");
    } finally {
      setSavingId(null);
    }
  };

  // open single delete modal
  const confirmDelete = (slide) => setDeleteModal(slide);

  // delete single slide (modal confirm)
  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);

    try {
      const res = await fetch(`${API_URL}/admin/sliders/${deleteModal._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("✅ Slide deleted");
      setDeleteModal(null);
      fetchSlides();
    } catch {
      toast.error("❌ Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // ✅ delete all slides handler
  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      const res = await fetch(`${API_URL}/admin/sliders/delete-all`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Delete all failed");

      toast.success("🗑 All slides deleted!");
      setDeleteAllModal(false);
      fetchSlides();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete all slides");
    } finally {
      setDeletingAll(false);
    }
  };

  // toggle active (single)
  const handleToggle = async (id) => {
    try {
      await fetch(`${API_URL}/admin/sliders/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      fetchSlides();
    } catch {
      toast.error("❌ Toggle failed");
    }
  };

  // ✅ any active?
  const hasAnyActive = slides.some((s) => s.isActive);

  // ✅ bulk toggle all slides
  const toggleAllSlides = async () => {
    try {
      const shouldHideAll = hasAnyActive;

      const targets = slides.filter((s) =>
        shouldHideAll ? s.isActive : !s.isActive
      );

      await Promise.all(
        targets.map((s) =>
          fetch(`${API_URL}/admin/sliders/${s._id}/toggle`, {
            method: "PATCH",
            credentials: "include",
          })
        )
      );

      toast.success(
        shouldHideAll ? "✅ All slides hidden" : "✅ All slides active"
      );
      fetchSlides();
    } catch (e) {
      console.error(e);
      toast.error("❌ Bulk toggle failed");
    }
  };

  // ✅ FILTERED SLIDES
  const filteredSlides =
    filter === "all"
      ? slides
      : slides.filter((s) => (filter === "active" ? s.isActive : !s.isActive));

  // ✅ Skeleton UI
  if (pageLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-56 bg-gray-200 rounded animate-pulse" />
        </div>
        <SliderPanelSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Toaster position="top-right" />

      {/* ===================== HEADER ===================== */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">✨ Sliders</h1>

        {/* Right side controls */}
        <div className="flex flex-col items-end gap-2 lg:flex-row lg:items-center lg:gap-2 lg:ml-auto">
          {/* ✅ ADD SLIDE */}
          <button
            onClick={() => {
              setEditSlide(null);
              setShowModal(true);
            }}
            className="order-1 lg:order-last bg-indigo-600 text-white shadow font-semibold px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 active:scale-[0.98] lg:px-4 lg:py-2 lg:text-sm lg:rounded-lg"
          >
            + Add New Slide
          </button>

          {/* FILTER BUTTONS + HIDE/SHOW ALL + DELETE ALL */}
          <div className="order-2 lg:order-first flex flex-wrap justify-end gap-1.5 lg:gap-2">
            <button
              className={`px-2.5 py-1.5 rounded-md border text-xs leading-none lg:px-4 lg:py-2.5 lg:text-base lg:rounded-lg ${
                filter === "all" ? "bg-indigo-600 text-white" : "bg-white"
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </button>

            <button
              className={`px-2.5 py-1 rounded-md border text-xs leading-none lg:px-4 lg:py-2 lg:text-base lg:rounded-lg ${
                filter === "active" ? "bg-green-600 text-white" : "bg-white"
              }`}
              onClick={() => setFilter("active")}
            >
              Active
            </button>

            <button
              className={`px-2.5 py-1 rounded-md border text-xs leading-none lg:px-4 lg:py-2 lg:text-base lg:rounded-lg ${
                filter === "hidden" ? "bg-gray-600 text-white" : "bg-white"
              }`}
              onClick={() => setFilter("hidden")}
            >
              Hidden
            </button>

            {slides.length > 0 && (
              <button
                onClick={toggleAllSlides}
                className={`px-2.5 py-1 rounded-md border text-xs leading-none font-semibold text-white lg:px-4 lg:py-2 lg:text-base lg:rounded-lg ${
                  hasAnyActive
                    ? "bg-gray-700 hover:bg-gray-800"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {hasAnyActive ? "Hide All" : "Show All"}
              </button>
            )}

            {slides.length > 0 && (
              <button
                onClick={() => setDeleteAllModal(true)}
                className="px-2.5 py-1 rounded-md border text-xs leading-none font-semibold text-white bg-red-600 hover:bg-red-700 lg:px-4 lg:py-2 lg:text-base lg:rounded-lg"
              >
                🗑 Delete All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===================== SLIDES GRID ===================== */}
      {filteredSlides.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No slides found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
          {filteredSlides.map((s) => (
            <div
              key={s._id}
              className={`border border-gray-200 rounded-xl p-3 shadow-sm flex flex-col h-full transition ${
                s.isActive ? "bg-white" : "bg-gray-50 opacity-70 grayscale"
              }`}
            >
              <div className="aspect-[3/1] bg-gray-100 rounded-lg overflow-hidden relative">
                {s.src ? (
                  <img
                    src={s.src}
                    alt={s.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full grid place-items-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}

                {!s.isActive && (
                  <span className="absolute top-2 left-2 text-[11px] bg-gray-800/70 text-white px-2 py-0.5 rounded">
                    Hidden
                  </span>
                )}
              </div>

              <div className="flex flex-col flex-1 mt-2">
                <h2
                  className={`font-semibold truncate min-h-[24px] ${
                    s.isActive ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {s.title || "No Title"}
                </h2>

                <p
                  className={`text-xs truncate min-h-[18px] ${
                    s.isActive ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {s.href || "No link"}
                </p>

                <div className="flex justify-between items-center mt-2 min-h-[28px]">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    Serial No: {s.order ?? 1}
                  </span>

                  <button
                    onClick={() => handleToggle(s._id)}
                    className={`text-xs px-2 py-0.5 rounded ${
                      s.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {s.isActive ? "Active" : "Hidden"}
                  </button>
                </div>

                <div className="mt-auto pt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditSlide(s);
                      setShowModal(true);
                    }}
                    className="flex-1 bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => confirmDelete(s)}
                    className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Add/Edit Modal */}
      <AddSlideModal
        showModal={showModal}
        closeModal={() => {
          setShowModal(false);
          setEditSlide(null);
        }}
        onSubmit={handleSave}
        loading={savingId === (editSlide?._id || "new")}
        editId={editSlide?._id || null}
        initialData={editSlide}
        slidesLength={slides.length}
        processSliderImage={(file) =>
          resizeToWebP_1500x500(
            file,
            SLIDER_IMAGE_RULE.width,
            SLIDER_IMAGE_RULE.height,
            SLIDER_IMAGE_RULE.maxBytes
          )
        }
      />

      {/* ✅ Single DELETE POPUP */}
      {deleteModal && (
        <>
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl border">
              <h2 className="text-xl font-bold text-red-600 mb-3">
                ⚠ Delete Slide
              </h2>

              <p className="text-gray-700 mb-6">
                আপনি কি নিশ্চিত{" "}
                <span className="font-semibold">
                  {deleteModal.title || "this slide"}
                </span>{" "}
                ডিলিট করতে চান?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 border rounded"
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ✅ DELETE ALL POPUP */}
      {deleteAllModal && (
        <>
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl border">
              <h2 className="text-xl font-bold text-red-600 mb-3">
                ⚠ Delete ALL Slides
              </h2>

              <p className="text-gray-700 mb-6">
                আপনি কি নিশ্চিত সবগুলো স্লাইড ডিলিট করতে চান?
                <br />
                <span className="font-semibold text-red-600">
                  (এই কাজটি করলে কোন স্লাইড থাকবে না)
                </span>
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteAllModal(false)}
                  className="px-4 py-2 border rounded"
                  disabled={deletingAll}
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteAll}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                  disabled={deletingAll}
                >
                  {deletingAll ? "Deleting..." : "Delete All"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
