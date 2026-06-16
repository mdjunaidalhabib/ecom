import Product from "../../src/models/Product.js";

export const shiftOrdersForInsert = async (newOrder, excludeId = null) => {
  const filter = excludeId
    ? { _id: { $ne: excludeId }, order: { $gte: newOrder } }
    : { order: { $gte: newOrder } };
  await Product.updateMany(filter, { $inc: { order: 1 } });
};

export const normalizeOrders = async () => {
  const items = await Product.find().sort({ order: 1, createdAt: 1 });
  for (let i = 0; i < items.length; i++) {
    const expected = i + 1;
    if (items[i].order !== expected) {
      items[i].order = expected;
      await items[i].save();
    }
  }
};
