import mongoose from "mongoose";
import Product from "../../models/Product.js";
import Category from "../../models/Category.js";

// ─── Helper: tenant DB থেকে model নাও ──────────────────────
const getModels = (req) => {
  if (req.tenantDb) {
    const ProductModel = req.tenantDb.models.Product ||
      req.tenantDb.model("Product", Product.schema);
    const CategoryModel = req.tenantDb.models.Category ||
      req.tenantDb.model("Category", Category.schema);
    return { ProductModel, CategoryModel };
  }
  return { ProductModel: Product, CategoryModel: Category };
};

// ─── Admin: Create Product ────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const { ProductModel } = getModels(req);

    let data = {};
    if (req.body.product && typeof req.body.product === "string") {
      try { data = JSON.parse(req.body.product); } catch { data = {}; }
    } else {
      data = { ...req.body };
    }

    // images from multer
    const uploadedFiles = req.files || [];
    const imageFields = {};
    uploadedFiles.forEach((f) => {
      if (f.fieldname === "image") imageFields.image = f.path || f.location || "";
      if (f.fieldname === "images[]" || f.fieldname === "images") {
        imageFields.images = imageFields.images || [];
        imageFields.images.push(f.path || f.location || "");
      }
    });

    // parse colors if string
    if (data.colors && typeof data.colors === "string") {
      try { data.colors = JSON.parse(data.colors); } catch { data.colors = []; }
    }

    const product = await ProductModel.create({ ...data, ...imageFields });
    return res.status(201).json(product);
  } catch (err) {
    console.error("❌ createProduct error:", err);
    return res.status(400).json({ error: err.message });
  }
};

// ─── Admin: Get All Products ──────────────────────────────
export const getProductsAdmin = async (req, res) => {
  try {
    const { ProductModel } = getModels(req);
    const { search, category, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;

    const products = await ProductModel.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await ProductModel.countDocuments(filter);
    return res.json({ products, total, page: Number(page) });
  } catch (err) {
    console.error("❌ getProductsAdmin error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ─── Admin: Get Product By ID ─────────────────────────────
export const getProductByIdAdmin = async (req, res) => {
  try {
    const { ProductModel } = getModels(req);
    const product = await ProductModel.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

// ─── Admin: Update Product ────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const { ProductModel } = getModels(req);
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let data = {};
    if (req.body.product && typeof req.body.product === "string") {
      try { data = JSON.parse(req.body.product); } catch { data = {}; }
    } else {
      data = { ...req.body };
    }

    if (data.colors && typeof data.colors === "string") {
      try { data.colors = JSON.parse(data.colors); } catch { data.colors = []; }
    }

    const uploadedFiles = req.files || [];
    uploadedFiles.forEach((f) => {
      if (f.fieldname === "image") data.image = f.path || f.location || "";
      if (f.fieldname === "images[]" || f.fieldname === "images") {
        data.images = data.images || [];
        data.images.push(f.path || f.location || "");
      }
    });

    Object.assign(product, data);
    await product.save();
    return res.json(product);
  } catch (err) {
    console.error("❌ updateProduct error:", err);
    return res.status(400).json({ error: err.message });
  }
};

// ─── Admin: Delete Product ────────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const { ProductModel } = getModels(req);
    const product = await ProductModel.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json({ message: "Product deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

// ─── Public: Get All Products ─────────────────────────────
export const getProductsPublic = async (req, res) => {
  try {
    const { ProductModel } = getModels(req);
    const { search, category, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };
    if (search) filter.$text = { $search: search };
    if (category) filter.category = new mongoose.Types.ObjectId(category);

    const products = await ProductModel.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await ProductModel.countDocuments(filter);
    return res.json({ products, total, page: Number(page) });
  } catch (err) {
    console.error("❌ getProductsPublic error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ─── Public: Get Product By ID ────────────────────────────
export const getProductByIdPublic = async (req, res) => {
  try {
    const { ProductModel } = getModels(req);
    const product = await ProductModel.findOne({
      _id: req.params.id,
      isActive: true,
    }).lean();
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

// ─── Public: Get Products By Category ────────────────────
export const getProductsByCategoryPublic = async (req, res) => {
  try {
    const { ProductModel } = getModels(req);
    const products = await ProductModel.find({
      category: req.params.categoryId,
      isActive: true,
    }).sort({ order: 1, createdAt: -1 }).lean();
    return res.json({ products });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

// ─── Public: Add Review ───────────────────────────────────
export const addReviewToProduct = async (req, res) => {
  try {
    const { ProductModel } = getModels(req);
    const { rating, comment } = req.body;
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.reviews.push({
      userId: req.user._id,
      user: req.user.name || "",
      avatar: req.user.avatar || "",
      rating: Number(rating) || 0,
      comment: comment || "",
    });

    // recalc average rating
    const total = product.reviews.reduce((s, r) => s + r.rating, 0);
    product.rating = total / product.reviews.length;
    await product.save();
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

// ─── Public: Update Review ────────────────────────────────
export const updateProductReview = async (req, res) => {
  try {
    const { ProductModel } = getModels(req);
    const { rating, comment } = req.body;
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (String(review.userId) !== String(req.user._id))
      return res.status(403).json({ error: "Not your review" });

    review.rating = Number(rating) ?? review.rating;
    review.comment = comment ?? review.comment;

    const total = product.reviews.reduce((s, r) => s + r.rating, 0);
    product.rating = total / product.reviews.length;
    await product.save();
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

// ─── Public: Delete Review ────────────────────────────────
export const deleteProductReview = async (req, res) => {
  try {
    const { ProductModel } = getModels(req);
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ error: "Review not found" });
    if (String(review.userId) !== String(req.user._id))
      return res.status(403).json({ error: "Not your review" });

    review.deleteOne();
    if (product.reviews.length > 0) {
      const total = product.reviews.reduce((s, r) => s + r.rating, 0);
      product.rating = total / product.reviews.length;
    } else {
      product.rating = 0;
    }
    await product.save();
    return res.json({ message: "Review deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};
