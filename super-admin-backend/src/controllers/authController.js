import jwt from "jsonwebtoken";
import SuperAdmin from "../models/SuperAdmin.js";

const cookieOpts = {
  httpOnly: true,
  secure: false, // dev এ false রাখো
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ─── Login ────────────────────────────────────────────────────
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", email);

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const admin = await SuperAdmin.findOne({ email });
    if (!admin) {
      console.log("❌ Admin not found:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await admin.matchPassword(password);
    if (!match) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.SA_JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("✅ Token generated:", token.slice(0, 20) + "...");

    admin.lastLoginAt = new Date();
    admin.lastLoginIp = req.ip || req.headers["x-forwarded-for"];
    await admin.save();

    res.cookie("sa_token", token, cookieOpts);
    console.log("🍪 Cookie set with opts:", cookieOpts);

    res.json({
      message: "Login successful",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        avatar: admin.avatar,
      },
    });
  } catch (err) {
    console.error("SA Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Logout ───────────────────────────────────────────────────
export const logoutSuperAdmin = (req, res) => {
  res.clearCookie("sa_token", cookieOpts);
  console.log("🚪 Logged out, cookie cleared");
  res.json({ message: "Logged out" });
};

// ─── Me ───────────────────────────────────────────────────────
export const meSuperAdmin = async (req, res) => {
  try {
    console.log("👤 /me called, cookies:", req.cookies);
    const admin = await SuperAdmin.findById(req.superAdmin._id).select(
      "-password",
    );
    res.json({ admin });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
