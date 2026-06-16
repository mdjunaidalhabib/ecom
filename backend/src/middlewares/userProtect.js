import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const userProtect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";

    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = auth.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
      return res.status(401).json({ error: message });
    }

    const user = await User.findById(decoded.id).select(
      "_id name email avatar"
    );
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; // ✅ controller uses this
    next();
  } catch (err) {
    console.error("userProtect error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
