/* ================== ✅ COMMON IMAGE CONVERT UTILS ================== */

/**
 * ✅ Load Image from File
 */
export const loadImageFromFile = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image"));
    };

    img.src = url;
  });

/**
 * ✅ Convert ANY jpeg/png/webp -> target WEBP under maxBytes
 * - center crop square
 * - resize to width × height
 * - quality loop to keep under maxBytes
 */
export const convertToWebpUnderLimit = async (file, rule) => {
  if (!file) throw new Error("No file selected");

  const {
    type = "image/webp",
    width = 600,
    height = 600,
    maxBytes = 100 * 1024,
    allowedInputTypes = ["image/webp", "image/jpeg", "image/png"],
    startQuality = 0.92,
    minQuality = 0.3,
    qualityStep = 0.07,
  } = rule || {};

  if (!allowedInputTypes.includes(file.type)) {
    throw new Error("Only jpeg/png/webp allowed");
  }

  const img = await loadImageFromFile(file);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // ✅ center crop to square
  const sw = img.naturalWidth;
  const sh = img.naturalHeight;
  const side = Math.min(sw, sh);

  const sx = Math.floor((sw - side) / 2);
  const sy = Math.floor((sh - side) / 2);

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, sx, sy, side, side, 0, 0, width, height);

  // ✅ quality loop
  let quality = startQuality;
  let blob = await new Promise((res) => canvas.toBlob(res, type, quality));
  if (!blob) throw new Error("Conversion failed");

  while (blob.size > maxBytes && quality > minQuality) {
    quality -= qualityStep;
    blob = await new Promise((res) => canvas.toBlob(res, type, quality));
    if (!blob) throw new Error("Conversion failed");
  }

  if (blob.size > maxBytes) {
    throw new Error(
      `Could not compress under ${Math.floor(maxBytes / 1024)}KB`
    );
  }

  // ✅ blob -> File
  const newName =
    (file.name || "image").replace(/\.(png|jpg|jpeg|webp)$/i, "") + ".webp";

  return new File([blob], newName, {
    type,
    lastModified: Date.now(),
  });
};
