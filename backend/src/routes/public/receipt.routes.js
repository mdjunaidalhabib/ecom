import express from "express";
import mongoose from "mongoose";
import Order from "../../models/Order.js";
import { generateReceiptPDF } from "../../pdfTemplates/receiptContent.js";

const router = express.Router();

router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const fileName = `HabibsFashion-${order._id}.pdf`;
    const isDownload = req.query.download === "true";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${isDownload ? "attachment" : "inline"}; filename="${fileName}"`
    );
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    generateReceiptPDF(order, res);
  } catch (err) {
    console.error("❌ Receipt PDF error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to generate receipt",
        details: err.message,
      });
    }
  }
});

export default router;
