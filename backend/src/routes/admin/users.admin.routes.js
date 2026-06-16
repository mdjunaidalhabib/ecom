import express from "express";
import User from "../../models/User.js";

const router = express.Router();

// সব ইউজার আনা
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
