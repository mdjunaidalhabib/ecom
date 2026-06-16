import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    src: { type: String, required: true }, // cloudinary secure_url
    srcPublicId: { type: String, default: "" }, // cloudinary public_id
    alt: { type: String, default: "" },
    href: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Slider", sliderSchema);
