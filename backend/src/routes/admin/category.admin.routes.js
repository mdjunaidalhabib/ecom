import express from "express";
import { categoryUpload } from "../../../utils/cloudinary/upload.js";
import {
  createCategory,
  updateCategory,
  getCategoriesAdmin,
  getCategoryByIdAdmin,
  deleteCategory,
} from "../../../controllers/category/index.js";

const router = express.Router();

router.post("/", categoryUpload.single("image"), createCategory);
router.get("/", getCategoriesAdmin);
router.get("/:id", getCategoryByIdAdmin);
router.put("/:id", categoryUpload.single("image"), updateCategory);
router.delete("/:id", deleteCategory);

export default router;
