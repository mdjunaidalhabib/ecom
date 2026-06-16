import express from "express";
import Analytics from "../../models/Analytics.js";

const router = express.Router();

// 🔵 VISIT UPDATE
router.post("/", async (req, res) => {
  try {
    const { deviceType } = req.body;

    let stats = await Analytics.findOne();
    if (!stats) stats = await Analytics.create({});

    // 🔹 Reset today if new day
    const today = new Date().toDateString();
    const last = new Date(stats.lastReset).toDateString();
    if (today !== last) {
      stats.todayVisitors = 0;
      stats.mobile = 0;
      stats.desktop = 0;
      stats.lastReset = new Date();
    }

    // 🔹 Increment counters
    stats.totalVisitors += 1;
    stats.todayVisitors += 1;
    if (deviceType === "Mobile") stats.mobile += 1;
    else stats.desktop += 1;

    await stats.save();
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// 🔵 GET STATS
router.get("/stats", async (req, res) => {
  try {
    let stats = await Analytics.findOne();
    if (!stats) stats = await Analytics.create({});
    res.json(stats);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

export default router;
