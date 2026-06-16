import express from "express";
import { productUpload } from "../../../utils/cloudinary/upload.js";
import {
  createProduct,
  getProductsAdmin,
  getProductByIdAdmin,
  updateProduct,
  deleteProduct,
} from "../../../controllers/product/index.js";

const router = express.Router();

router.post("/", productUpload.any(), createProduct);
router.get("/", getProductsAdmin);
router.get("/:id", getProductByIdAdmin);
router.put("/:id", productUpload.any(), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
