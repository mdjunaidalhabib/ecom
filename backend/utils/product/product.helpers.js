export const toNumber = (val, fallback = 0) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
};

export const computeIsSoldOut = ({ hasVariants, stock, colors }) => {
  const baseStock = toNumber(stock, 0);

  if (!hasVariants) return baseStock <= 0;

  const list = Array.isArray(colors) ? colors : [];
  if (list.length === 0) return baseStock <= 0;

  const anyInStock = list.some((c) => toNumber(c?.stock, 0) > 0);
  return !anyInStock;
};

export const computeVariantTotalStock = (colors) => {
  const list = Array.isArray(colors) ? colors : [];
  return list.reduce((sum, c) => sum + toNumber(c?.stock, 0), 0);
};
