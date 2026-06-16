import express from "express";
import Admin from "../../models/Admin.js";

import {
  protect,
  superAdminOnly,
} from "../../middlewares/adminAuthMiddleware.js";

import { loginAdmin, logoutAdmin } from "../../controllers/auth/index.js";

const router = express.Router();

// ─── Helper ───────────────────────────────────────────────
const getAdminModel = (req) => {
  if (req.tenantDb) {
    return req.tenantDb.models.Admin ||
      req.tenantDb.model("Admin", Admin.schema);
  }
  return Admin;
};

router.post("/login", loginAdmin);
router.post("/logout", protect, logoutAdmin);

router.get("/verify", protect, async (req, res) => {
  try {
    const AdminModel = getAdminModel(req);
    const freshAdmin = await AdminModel.findById(req.admin._id).select("-password");
    if (!freshAdmin) {
      return res.status(401).json({ message: "Admin not found" });
    }
    res.json({ message: "✅ Auth verified", admin: freshAdmin });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    res.json(req.admin);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/me", protect, async (req, res) => {
  try {
    const AdminModel = getAdminModel(req);
    const admin = await AdminModel.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    let data = { ...req.body };
    if (data.profile && typeof data.profile === "string") {
      try { data = JSON.parse(data.profile); } catch { data = {}; }
    }

    if (data.name) admin.name = data.name;
    if (data.username) admin.username = data.username;
    if (data.phone) admin.phone = data.phone;
    if (data.address) admin.address = data.address;

    await admin.save();
    const adminObj = admin.toObject();
    delete adminObj.password;
    res.json({ message: "✅ Profile updated", admin: adminObj });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/me/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current & new password required" });
    }

    const AdminModel = getAdminModel(req);
    const admin = await AdminModel.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const ok = await admin.matchPassword(currentPassword);
    if (!ok) {
      return res.status(400).json({ message: "❌ Current password incorrect" });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ message: "✅ Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
