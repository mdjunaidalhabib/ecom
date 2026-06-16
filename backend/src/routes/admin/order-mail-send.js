import express from "express";
import { getOrderMailSendSettings } from "../../../utils/mail/index.js";
import { sendAdminOrderEmail } from "../../../utils/mail/sendAdminOrderEmail.js";

const router = express.Router();

// GET
router.get("/", async (req, res) => {
  const settings = await getOrderMailSendSettings();
  res.json(settings);
});

// PATCH
router.patch("/", async (req, res) => {
  const settings = await getOrderMailSendSettings();
  const { addEmail, setActive, deleteEmail, enabled } = req.body;

  if (typeof enabled === "boolean") {
    settings.enabled = enabled;
  }

  if (addEmail && settings.emails.length < 5) {
    const exists = settings.emails.find((e) => e.email === addEmail);
    if (!exists) {
      settings.emails.push({ email: addEmail, active: false });
    }
  }

  if (setActive) {
    settings.emails.forEach((e) => (e.active = false));
    const target = settings.emails.find((e) => e.email === setActive);
    if (target) target.active = true;
  }

  if (deleteEmail) {
    settings.emails = settings.emails.filter((e) => e.email !== deleteEmail);
  }

  await settings.save();
  res.json(settings);
});

// TEST MAIL
router.post("/test", async (req, res) => {
  const settings = await getOrderMailSendSettings();

  if (!settings.enabled)
    return res.status(400).json({ error: "System disabled" });

  const active = settings.emails.find((e) => e.active);

  if (!active) return res.status(400).json({ error: "No active email" });

  await sendAdminOrderEmail({
    to: active.email,
    orderId: "TEST-123",
    customerName: "Test User",
    customerPhone: "01700000000",
    address: "Dhaka",
    items: [],
    subtotal: 0,
    deliveryCharge: 0,
    discount: 0,
    total: 0,
    paymentMethod: "COD",
  });

  res.json({ success: true });
});

export default router;
