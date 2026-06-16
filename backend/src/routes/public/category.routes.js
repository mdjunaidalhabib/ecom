import express from "express";
import {
  getCategoriesPublic,
  getCategoryByIdPublic,
} from "../../../controllers/category/index.js";

const router = express.Router();

router.get("/", getCategoriesPublic);
router.get("/:id", getCategoryByIdPublic);

export default router;
