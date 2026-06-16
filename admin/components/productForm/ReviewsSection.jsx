export default function ReviewsSection({
  form,
  averageRating,
  addReview,
  handleReviewChange,
  removeReview,
  errors = {},
  setErrors = () => {},
}) {
  const base = "w-full border p-2 rounded transition focus:outline-none";
  const ok = "border-gray-300 focus:ring-2 focus:ring-indigo-200";
  const err = "border-red-500 focus:ring-2 focus:ring-red-200";

  return (
    <section className="bg-gray-50 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold">⭐ রিভিউ</h2>
        <button
          type="button"
          onClick={addReview}
          className="text-indigo-600 text-sm font-semibold"
        >
          + নতুন
        </button>
      </div>

      {/* Average Rating */}
      <div className="bg-white p-3 border rounded">
        <label className="text-sm font-semibold">Average Rating</label>
        <input
          value={averageRating}
          disabled
          className="w-full border bg-gray-100 p-2 rounded mt-1"
        />
      </div>

      {/* Reviews */}
      {form.reviews.map((r, i) => {
        const ratingError = errors[`reviewRating_${i}`];

        return (
          <div key={i} className="bg-white p-3 border rounded space-y-3">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold">নাম</label>
              <input
                value={r.user}
                placeholder="নাম"
                onChange={(e) => handleReviewChange(i, "user", e.target.value)}
                className={`${base} ${ok}`}
              />
            </div>

            {/* Rating */}
            <div>
              <label className="text-xs font-semibold">
                Rating <span className="text-red-500">*</span>{" "}
                <span className="text-gray-400">(0 – 5)</span>
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={r.rating}
                placeholder="0 - 5"
                onChange={(e) => {
                  const raw = e.target.value;
                  const val = Number(raw);

                  // ❌ invalid number
                  if (raw === "") {
                    handleReviewChange(i, "rating", "");
                    setErrors((p) => ({
                      ...p,
                      [`reviewRating_${i}`]: "রেটিং দিন (০–৫)",
                    }));
                    return;
                  }

                  // ❌ greater than 5
                  if (val > 5) {
                    handleReviewChange(i, "rating", 5); // clamp
                    setErrors((p) => ({
                      ...p,
                      [`reviewRating_${i}`]: "রেটিং ৫ এর বেশি হতে পারে না",
                    }));
                    return;
                  }

                  // ❌ less than 0
                  if (val < 0) {
                    handleReviewChange(i, "rating", 0); // clamp
                    setErrors((p) => ({
                      ...p,
                      [`reviewRating_${i}`]: "রেটিং ০ এর কম হতে পারে না",
                    }));
                    return;
                  }

                  // ✅ valid
                  handleReviewChange(i, "rating", val);
                  setErrors((p) => ({
                    ...p,
                    [`reviewRating_${i}`]: null,
                  }));
                }}
                className={`${base} ${ratingError ? err : ok}`}
              />

              {ratingError && (
                <p className="text-xs text-red-600 mt-1">{ratingError}</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="text-xs font-semibold">Comment</label>
              <textarea
                value={r.comment}
                placeholder="Comment"
                onChange={(e) =>
                  handleReviewChange(i, "comment", e.target.value)
                }
                className={`${base} ${ok}`}
              />
            </div>

            {/* Remove */}
            <button
              type="button"
              onClick={() => removeReview(i)}
              className="text-red-600 text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        );
      })}
    </section>
  );
}
