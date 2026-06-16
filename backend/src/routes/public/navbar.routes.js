import express from "express";
import Navbar from "../../models/Navbar.js";

const router = express.Router();

// ✅ GET Navbar (Public)
// FINAL path: GET /api/v1/navbar
router.get("/", async (req, res) => {
  try {
    const navbar = await Navbar.findOne();
    res.json(navbar || {});
  } catch (err) {
    console.error("❌ Error fetching navbar:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
