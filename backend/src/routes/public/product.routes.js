import express from "express";
import {
  getProductsPublic,
  getProductByIdPublic,
  getProductsByCategoryPublic,
  addReviewToProduct,
  updateProductReview,
  deleteProductReview,
} from "../../../controllers/product/index.js";

import { userProtect } from "../../middlewares/userProtect.js";

const router = express.Router();

router.get("/", getProductsPublic);
router.get("/category/:categoryId", getProductsByCategoryPublic);
router.get("/:id", getProductByIdPublic);

router.post("/:id/review", userProtect, addReviewToProduct);
router.put("/:id/review/:reviewId", userProtect, updateProductReview);
router.delete("/:id/review/:reviewId", userProtect, deleteProductReview);

export default router;
