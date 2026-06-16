export const normalizeReviews = (reviews = []) => {
  return reviews.map((r) => {
    const obj = r?.toObject ? r.toObject() : r;

    return {
      ...obj,
      _id: obj?._id ? String(obj._id) : obj._id,
      userId: obj?.userId ? String(obj.userId) : null,
      createdAt: obj?.createdAt || null,
      updatedAt: obj?.updatedAt || null,
    };
  });
};
