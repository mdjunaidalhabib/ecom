import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    plan: { type: String, enum: ["basic", "pro", "enterprise"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "BDT" },
    durationDays: { type: Number, required: true },

    // ─── Payment Method ──────────────────────────────────────
    method: {
      type: String,
      enum: ["bkash", "nagad", "manual", "bank"],
      required: true,
    },
    transactionId: { type: String, trim: true }, // bKash/Nagad TrxID
    transactionNumber: { type: String },          // bKash/Nagad sender number
    screenshot: { type: String },                 // Cloudinary URL (payment proof)
    screenshotPublicId: { type: String },

    // ─── Status ──────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },

    // ─── Plan dates this payment covers ──────────────────────
    planStartDate: { type: Date },
    planEndDate: { type: Date },

    // ─── Notes ───────────────────────────────────────────────
    notes: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" }, // manual entry
  },
  { timestamps: true }
);

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;
