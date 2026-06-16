import express from "express";
import Order from "../../models/Order.js";
import CourierSetting from "../../models/CourierSetting.js";

const router = express.Router();
/* ======================================================
   🔑 Helper: Get active courier config (steadfast)
====================================================== */
async function getActiveCourier(courier = "steadfast") {
  const setting = await CourierSetting.findOne({
    courier,
    isActive: true,
  }).lean();

  if (!setting) {
    const err = new Error("Courier setting not found or inactive");
    err.code = "COURIER_NOT_CONFIGURED";
    throw err;
  }

  if (!setting.apiKey || !setting.secretKey) {
    const err = new Error("Courier apiKey/secretKey missing in DB");
    err.code = "COURIER_KEYS_MISSING";
    throw err;
  }

  return setting;
}

/* ======================================================
   🌐 Helper: Fetch Steadfast delivery status (V1 doc)
   Base: https://portal.packzy.com/api/v1
   - /status_by_cid/{id}
   - /status_by_trackingcode/{trackingCode}
====================================================== */
async function fetchSteadfastStatus({
  apiKey,
  secretKey,
  consignmentId,
  trackingId,
}) {
  const baseUrl = (
    process.env.STEADFAST_BASE_URL || "https://portal.packzy.com/api/v1"
  ).replace(/\/+$/, "");

  const url = consignmentId
    ? `${baseUrl}/status_by_cid/${consignmentId}`
    : `${baseUrl}/status_by_trackingcode/${trackingId}`;

  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Api-Key": apiKey,
      "Secret-Key": secretKey,
      Accept: "application/json",
    },
  });

  const raw = await resp.text();
  let data = null;
  try {
    data = JSON.parse(raw);
  } catch {}

  if (!resp.ok || data?.status !== 200) {
    const err = new Error(data?.message || "Steadfast status fetch failed");
    err.meta = { url, httpStatus: resp.status, rawResponse: raw, parsed: data };
    throw err;
  }

  return {
    delivery_status: data?.delivery_status || "unknown",
    raw: data,
    url,
  };
}

/* ======================================================
   ✅ GET /admin/api/courier/status?trackingId=...
   - Find order
   - Call Steadfast status endpoint (live)
   - Update DB: order.courier.status
   - Return latest status
====================================================== */
router.get("/status", async (req, res) => {
  const { trackingId } = req.query;

  if (!trackingId) {
    return res.status(400).json({ ok: false, error: "trackingId is required" });
  }

  try {
    const order = await Order.findOne({ "courier.trackingId": trackingId });
    if (!order)
      return res.status(404).json({ ok: false, error: "Order not found" });

    // If not steadfast, just return local
    if (order.courier?.provider !== "steadfast") {
      return res.json({
        ok: true,
        status: order.courier?.status || "unknown",
        courier: order.courier || null,
        orderId: order._id,
        source: "local",
      });
    }

    const cfg = await getActiveCourier("steadfast");
    const consignmentId = order.courier?.consignmentId || null;

    const { delivery_status, raw, url } = await fetchSteadfastStatus({
      apiKey: cfg.apiKey,
      secretKey: cfg.secretKey,
      consignmentId,
      trackingId,
    });

    // ✅ Update DB with latest status
    order.courier.status = delivery_status;
    order.courier.lastStatusSyncAt = new Date();
    order.courier.lastStatusRaw = raw; // optional debug, remove later if you want
    await order.save();

    return res.json({
      ok: true,
      status: delivery_status,
      courier: order.courier,
      orderId: order._id,
      source: "steadfast",
      steadfastUrl: url,
    });
  } catch (err) {
    console.error("🚨 Courier status error:", err?.meta || err);

    // fallback: return last saved status from DB
    const fallback = await Order.findOne({
      "courier.trackingId": trackingId,
    }).lean();

    return res.status(200).json({
      ok: true,
      status: fallback?.courier?.status || "unknown",
      courier: fallback?.courier || null,
      orderId: fallback?._id || null,
      source: "local_fallback",
      warning: "Steadfast API failed; showing last saved status",
      meta: err?.meta || null,
    });
  }
});

export default router;
