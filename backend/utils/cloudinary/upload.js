import multer from "multer";
import path from "path";

/* ================== ✅ STORAGE ================== */
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

/* ================== ✅ DEFAULT UPLOAD (GENERIC) ================== */
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 }, // ✅ 100KB
});

/* ================== ✅ CATEGORY UPLOAD ================== */
export const categoryUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ input can be larger (server will compress)
  fileFilter: (req, file, cb) => {
    const allowed = ["image/webp", "image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only jpeg/png/webp allowed"), false);
    }
    cb(null, true);
  },
});

/* ================== ✅ PRODUCT UPLOAD ================== */
export const productUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // ✅ input can be larger (server will compress)
    files: 40,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/webp", "image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error("Only jpeg/png/webp allowed (Auto convert to 600×600 WEBP)"),
        false
      );
    }
    cb(null, true);
  },
});

/* ================== ✅ SLIDER UPLOAD ==================
   ✅ UPDATED RULE:
   INPUT : jpeg/png/webp allowed
   OUTPUT: controller will convert to 1500×500 WEBP under 100KB
================================================== */
export const sliderUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ input can be larger
  fileFilter: (req, file, cb) => {
    const allowed = ["image/webp", "image/jpeg", "image/png"];
    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error("Only jpeg/png/webp allowed (Auto convert to 1500×500 WEBP)"),
        false
      );
    }
    cb(null, true);
  },
});

export default upload;
