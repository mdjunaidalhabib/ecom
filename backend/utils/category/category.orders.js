import Category from "../../src/models/Category.js";

// normalize sequence to 1..n (safety for legacy duplicates)
export const normalizeCategoryOrders = async () => {
  const items = await Category.find().sort({ order: 1, createdAt: 1 });

  for (let i = 0; i < items.length; i++) {
    const expected = i + 1;
    if (items[i].order !== expected) {
      items[i].order = expected;
      await items[i].save();
    }
  }
};
