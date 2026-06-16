import jwt from "jsonwebtoken";
import Admin from "../../models/Admin.js";

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

// ─── Helper: tenant DB থেকে Admin model নাও ────────────────
const getAdminModel = (req) => {
  if (req.tenantDb) {
    // connection এ আগে থেকে model থাকলে সেটা use করো
    if (req.tenantDb.models.Admin) return req.tenantDb.models.Admin;
    // না থাকলে Admin schema দিয়ে নতুন model তৈরি করো
    return req.tenantDb.model("Admin", Admin.schema);
  }
  // tenantMiddleware না থাকলে (fallback) default mongoose model
  return Admin;
};

// ─── Login ────────────────────────────────────────────────
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email এবং password দিন" });
    }

    const AdminModel = getAdminModel(req);
    const admin = await AdminModel.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(401).json({ message: "এই ইমেইলে কোনো অ্যাকাউন্ট নেই" });
    }

    if (admin.status === "suspended") {
      return res.status(403).json({ message: "এই অ্যাকাউন্টটি suspended করা হয়েছে" });
    }

    const match = await admin.matchPassword(password);
    if (!match) {
      return res.status(401).json({ message: "পাসওয়ার্ড ভুল হয়েছে" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // last login info update
    admin.lastLoginAt = new Date();
    admin.lastLoginIp = req.ip || req.headers["x-forwarded-for"] || "";
    await admin.save();

    res.cookie("admin_token", token, cookieOpts);

    return res.json({
      message: "Login successful",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar || "",
      },
    });
  } catch (err) {
    console.error("❌ loginAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── Logout ───────────────────────────────────────────────
export const logoutAdmin = (req, res) => {
  res.clearCookie("admin_token", { ...cookieOpts, maxAge: 0 });
  return res.json({ message: "Logged out" });
};
