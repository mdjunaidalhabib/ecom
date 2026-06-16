export default function VariantSelector({
  colors = [],
  selectedColor,
  onSelect,
}) {
  if (!colors?.length) return null;

  return (
    <div className="md:mb-4">
      <h3 className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 md:mb-2">
        Select Variant:
      </h3>

      <div className="flex flex-wrap gap-2">
        {colors.map((color, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => onSelect(color)}
            className={`px-2 py-1 text-[11px] md:px-4 md:py-2 md:text-sm border rounded-xl  font-semibold transition-all ${
              selectedColor?.name === color.name
                ? "border-orange-600 bg-orange-600 text-white shadow-lg shadow-orange-200"
                : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"
            }`}
          >
            {color.name}
          </button>
        ))}
      </div>
    </div>
  );
}
