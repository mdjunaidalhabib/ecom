import jwt from "jsonwebtoken";
import SuperAdmin from "../models/SuperAdmin.js";

export const protectSuperAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.sa_token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SA_JWT_SECRET);
    } catch (err) {
      const msg = err.name === "TokenExpiredError" ? "Session expired" : "Invalid token";
      return res.status(401).json({ message: msg });
    }

    const admin = await SuperAdmin.findById(decoded.id).select("-password");
    if (!admin) return res.status(401).json({ message: "Super admin not found" });

    req.superAdmin = admin;
    next();
  } catch (err) {
    console.error("SA Auth error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
