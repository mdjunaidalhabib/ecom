import express from "express";
import Order from "../../models/Order.js";

const router = express.Router();

/* ======================================================
   GET /admin/api/courier/live?trackingId=...
====================================================== */
router.get("/live", async (req, res) => {
  const { trackingId } = req.query;

  if (!trackingId) {
    return res.status(400).json({ ok: false, error: "trackingId is required" });
  }

  try {
    const order = await Order.findOne({
      "courier.trackingId": trackingId,
    }).lean();

    if (!order) {
      return res.status(404).json({ ok: false, error: "Order not found" });
    }

    // 🔥 Call Steadfast tracking endpoint
    const url = `https://steadfast.com.bd/track/consignment/${trackingId}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0",
      },
    });

    const raw = await resp.text();
    let data = null;

    try {
      data = JSON.parse(raw);
    } catch {
      console.log("❌ Failed to parse JSON from steadfast");
    }

    // If tracking data exists
    if (data?.status === 1 && Array.isArray(data?.trackings)) {
      const events = data.trackings.map((t) => ({
        status: t.text || "Unknown update",
        location: null,
        timestamp: t.created_at || new Date(),
      }));

      return res.json({
        ok: true,
        source: "steadfast",
        events,
      });
    }

    // 🔁 Fallback to DB stored status
    const fallbackEvents = [
      {
        status: order.courier?.status || "in_review",
        location: null,
        timestamp: order.courier?.sentAt || new Date(),
      },
    ];

    return res.json({
      ok: true,
      source: "local_fallback",
      events: fallbackEvents,
    });
  } catch (err) {
    console.error("🚨 Live tracking fetch error:", err);

    return res.status(500).json({
      ok: false,
      error: "Server error",
    });
  }
});

export default router;
