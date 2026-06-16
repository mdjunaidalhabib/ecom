import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───────────────────────────────────────────
    shopName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    ownerEmail: { type: String, required: true, unique: true, lowercase: true },
    ownerPhone: { type: String, trim: true },

    // ─── Domain Config ────────────────────────────────────────
    subdomain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      // e.g. "myshop" → myshop.glorixbd.com
    },
    customDomain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      // e.g. "mycustomshop.com"
    },

    // ─── Database ─────────────────────────────────────────────
    dbName: {
      type: String,
      required: true,
      unique: true,
      // e.g. "tenant_myshop_1234"
    },

    // ─── Plan ─────────────────────────────────────────────────
    plan: {
      type: String,
      enum: ["basic", "pro", "enterprise"],
      default: "basic",
    },
    planStartDate: { type: Date },
    planExpiryDate: { type: Date },
    planDaysLeft: { type: Number, default: 0 }, // virtual but also stored for quick query

    // ─── Status ───────────────────────────────────────────────
    status: {
      type: String,
      enum: ["active", "expired", "suspended", "pending"],
      default: "pending",
    },
    isLocked: { type: Boolean, default: false },
    lockReason: { type: String },

    // ─── Billing ──────────────────────────────────────────────
    autoRenew: { type: Boolean, default: false },
    lastPaymentDate: { type: Date },
    lastPaymentAmount: { type: Number },
    lastPaymentMethod: { type: String, enum: ["bkash", "nagad", "manual", "bank"] },
    totalPaid: { type: Number, default: 0 },

    // ─── Branding (per-tenant frontend config) ────────────────
    brandConfig: {
      primaryColor: { type: String, default: "#000000" },
      logo: { type: String }, // Cloudinary URL
      logoPublicId: { type: String },
      favicon: { type: String },
    },

    // ─── Notes ────────────────────────────────────────────────
    notes: { type: String },

    // ─── Created by ───────────────────────────────────────────
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" },
  },
  { timestamps: true }
);

// ─── Virtual: days left ───────────────────────────────────────
tenantSchema.virtual("daysRemaining").get(function () {
  if (!this.planExpiryDate) return 0;
  const diff = this.planExpiryDate - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// ─── Auto-update status before save ──────────────────────────
tenantSchema.pre("save", function (next) {
  if (this.planExpiryDate) {
    const now = new Date();
    this.planDaysLeft = Math.max(
      0,
      Math.ceil((this.planExpiryDate - now) / (1000 * 60 * 60 * 24))
    );
    if (this.planExpiryDate < now && this.status === "active") {
      this.status = "expired";
      this.isLocked = true;
    }
  }
  next();
});

const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);
export default Tenant;
