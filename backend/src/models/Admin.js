import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String },

    // ✅ Cloudinary avatar fields (Navbar style)
    avatar: { type: String }, // secure_url
    avatarPublicId: { type: String }, // public_id

    password: { type: String, required: true },
    role: { type: String, enum: ["superadmin", "admin"], default: "admin" },

    status: { type: String, enum: ["active", "suspended"], default: "active" },

    // ✅ Last login info
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },

    // ✅ Device / Browser / OS info
    lastLoginDevice: { type: String }, // PC / Mobile / Tablet
    lastLoginOS: { type: String }, // Windows 10 / Android 14
    lastLoginBrowser: { type: String }, // Chrome 142
    lastLoginUA: { type: String }, // full user-agent backup

    // ✅ Approx location from IP
    lastLoginLocation: {
      country: { type: String },
      city: { type: String },
      region: { type: String },
      lat: { type: Number },
      lon: { type: Number },
    },
  },
  { timestamps: true }
);

// Hash password before save
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;
