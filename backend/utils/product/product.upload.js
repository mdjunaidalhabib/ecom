import { cloudinary } from "../cloudinary/index.js";
import fs from "fs";
import streamifier from "streamifier";

/**
 * ✅ FINAL PRODUCT IMAGE RULE (match frontend/backend)
 * - 600×600
 * - WEBP
 * - <= 100KB target
 */
const PRODUCT_RULE = {
  width: 600,
  height: 600,
  format: "webp",
  maxBytes: 100 * 1024,
};

/**
 * ✅ Always build delivery URL with fixed rule
 * (no extra storage, only URL-based transform)
 */
const makeOptimizedUrl = (publicId) => {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width: PRODUCT_RULE.width, height: PRODUCT_RULE.height, crop: "fill" },
      { fetch_format: PRODUCT_RULE.format, quality: "auto:eco" },
    ],
  });
};

/**
 * ✅ Optional upload transform (only if file is too big or not webp)
 * ⚠️ Normally unnecessary if controller already converts.
 */
const getUploadTransformIfNeeded = (file) => {
  const sizeBytes = file?.size || 0;
  const mime = file?.mimetype || "";

  const need =
    sizeBytes > PRODUCT_RULE.maxBytes ||
    mime !== `image/${PRODUCT_RULE.format}`;

  if (!need) return undefined;

  return [
    { width: PRODUCT_RULE.width, height: PRODUCT_RULE.height, crop: "fill" },
    { format: PRODUCT_RULE.format, quality: "auto:eco" },
  ];
};

export const uploadToCloudinary = async (file, folder) => {
  if (!file) throw new Error("No file provided");

  const uploadTransformation = getUploadTransformIfNeeded(file);

  // ✅ 1) memoryStorage
  if (file?.buffer) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          ...(uploadTransformation
            ? { transformation: uploadTransformation }
            : {}),
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
    });

    return {
      ...result,
      // ✅ Always return optimized URL (600×600 webp q:auto:eco)
      optimizedUrl: makeOptimizedUrl(result.public_id),
    };
  }

  // ✅ 2) diskStorage
  if (file?.path) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "image",
      ...(uploadTransformation ? { transformation: uploadTransformation } : {}),
    });

    // ✅ remove local file
    try {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch (e) {
      console.warn("⚠️ Could not delete local file:", file.path);
    }

    return {
      ...result,
      // ✅ Always return optimized URL (600×600 webp q:auto:eco)
      optimizedUrl: makeOptimizedUrl(result.public_id),
    };
  }

  throw new Error("Invalid file: missing buffer/path");
};
