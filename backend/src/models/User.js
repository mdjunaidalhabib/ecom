import mongoose from "mongoose";
import Counter from "./Counter.js";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },

    userId: { type: Number, unique: true, index: true }, // ✅ auto incremented ID

    name: { type: String, default: "" },

    // ✅ optional email (unique + sparse)
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      default: "",
    },

    // ✅ Avatar field with default image
    avatar: {
      type: String,
      default: "https://i.pravatar.cc/150?u=default",
    },

    // ✅ NEW: profile details fields
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  { timestamps: true }
);

// ✅ Pre-save hook to auto-increment userId safely
userSchema.pre("save", async function (next) {
  if (this.isNew && (this.userId === undefined || this.userId === null)) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: "userId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.userId = counter?.seq ?? 1;
    } catch (e) {
      // fallback if counter fails
      this.userId = Math.floor(Date.now() / 1000);
    }
  }
  next();
});

export default mongoose.models.User || mongoose.model("User", userSchema);
