import Category from "../../models/Category.js";

// ─── Helper: tenant DB থেকে model নাও ──────────────────────
const getCategoryModel = (req) => {
  if (req.tenantDb) {
    return req.tenantDb.models.Category ||
      req.tenantDb.model("Category", Category.schema);
  }
  return Category;
};

// ─── Admin: Create Category ───────────────────────────────
export const createCategory = async (req, res) => {
  try {
    const CategoryModel = getCategoryModel(req);
    const { name, order, isActive } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Category name required" });
    }

    const data = {
      name: name.trim(),
      order: Number(order) || 1,
      isActive: isActive !== "false" && isActive !== false,
    };

    // image from multer (cloudinary)
    if (req.file) {
      data.image = req.file.path || req.file.location || "";
      data.imagePublicId = req.file.filename || req.file.public_id || "";
    }

    const category = await CategoryModel.create(data);
    return res.status(201).json(category);
  } catch (err) {
    console.error("❌ createCategory error:", err);
    return res.status(400).json({ error: err.message });
  }
};

// ─── Admin: Get All Categories ────────────────────────────
export const getCategoriesAdmin = async (req, res) => {
  try {
    const CategoryModel = getCategoryModel(req);
    const categories = await CategoryModel.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return res.json({ categories });
  } catch (err) {
    console.error("❌ getCategoriesAdmin error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ─── Admin: Get Category By ID ────────────────────────────
export const getCategoryByIdAdmin = async (req, res) => {
  try {
    const CategoryModel = getCategoryModel(req);
    const category = await CategoryModel.findById(req.params.id).lean();
    if (!category) return res.status(404).json({ error: "Category not found" });
    return res.json(category);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

// ─── Admin: Update Category ───────────────────────────────
export const updateCategory = async (req, res) => {
  try {
    const CategoryModel = getCategoryModel(req);
    const category = await CategoryModel.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    const { name, order, isActive } = req.body;

    if (name?.trim()) category.name = name.trim();
    if (order !== undefined) category.order = Number(order);
    if (isActive !== undefined) category.isActive = isActive !== "false" && isActive !== false;

    if (req.file) {
      category.image = req.file.path || req.file.location || "";
      category.imagePublicId = req.file.filename || req.file.public_id || "";
    }

    await category.save();
    return res.json(category);
  } catch (err) {
    console.error("❌ updateCategory error:", err);
    return res.status(400).json({ error: err.message });
  }
};

// ─── Admin: Delete Category ───────────────────────────────
export const deleteCategory = async (req, res) => {
  try {
    const CategoryModel = getCategoryModel(req);
    const category = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    return res.json({ message: "Category deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

// ─── Public: Get All Categories ──────────────────────────
export const getCategoriesPublic = async (req, res) => {
  try {
    const CategoryModel = getCategoryModel(req);
    const categories = await CategoryModel.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return res.json({ categories });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

// ─── Public: Get Category By ID ──────────────────────────
export const getCategoryByIdPublic = async (req, res) => {
  try {
    const CategoryModel = getCategoryModel(req);
    const category = await CategoryModel.findOne({
      _id: req.params.id,
      isActive: true,
    }).lean();
    if (!category) return res.status(404).json({ error: "Category not found" });
    return res.json(category);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};
