import Payment from "../models/Payment.js";
import Tenant from "../models/Tenant.js";

// ─── Add payment manually ─────────────────────────────────────
export const addPayment = async (req, res) => {
  try {
    const {
      tenantId, plan, amount, durationDays,
      method, transactionId, transactionNumber,
      notes,
    } = req.body;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const planStart = new Date();
    const planEnd = new Date();
    planEnd.setDate(planEnd.getDate() + Number(durationDays));

    const payment = await Payment.create({
      tenant: tenantId,
      plan,
      amount,
      durationDays,
      method,
      transactionId,
      transactionNumber,
      notes,
      planStartDate: planStart,
      planEndDate: planEnd,
      status: "verified",
      verifiedBy: req.superAdmin._id,
      verifiedAt: new Date(),
      addedBy: req.superAdmin._id,
    });

    // Extend the tenant plan
    const base =
      tenant.planExpiryDate && tenant.planExpiryDate > new Date()
        ? tenant.planExpiryDate
        : new Date();

    tenant.planExpiryDate = new Date(base);
    tenant.planExpiryDate.setDate(
      tenant.planExpiryDate.getDate() + Number(durationDays)
    );
    tenant.plan = plan;
    tenant.status = "active";
    tenant.isLocked = false;
    tenant.lastPaymentDate = new Date();
    tenant.lastPaymentAmount = amount;
    tenant.lastPaymentMethod = method;
    tenant.totalPaid = (tenant.totalPaid || 0) + Number(amount);
    if (!tenant.planStartDate) tenant.planStartDate = new Date();

    await tenant.save();

    res.status(201).json({ message: "Payment recorded and plan extended", payment, tenant });
  } catch (err) {
    console.error("Add payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Get all payments ─────────────────────────────────────────
export const getAllPayments = async (req, res) => {
  try {
    const { status, method, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate("tenant", "shopName subdomain customDomain ownerEmail")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ payments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Verify/reject a pending payment ─────────────────────────
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const payment = await Payment.findById(req.params.id).populate("tenant");
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = status;
    payment.verifiedBy = req.superAdmin._id;
    payment.verifiedAt = new Date();
    if (status === "rejected") payment.rejectionReason = rejectionReason;

    await payment.save();

    // If verified → extend plan
    if (status === "verified" && payment.tenant) {
      const tenant = await Tenant.findById(payment.tenant._id);
      const base =
        tenant.planExpiryDate && tenant.planExpiryDate > new Date()
          ? tenant.planExpiryDate
          : new Date();

      tenant.planExpiryDate = new Date(base);
      tenant.planExpiryDate.setDate(
        tenant.planExpiryDate.getDate() + payment.durationDays
      );
      tenant.status = "active";
      tenant.isLocked = false;
      tenant.lastPaymentDate = new Date();
      tenant.lastPaymentAmount = payment.amount;
      tenant.lastPaymentMethod = payment.method;
      tenant.totalPaid = (tenant.totalPaid || 0) + payment.amount;
      await tenant.save();
    }

    res.json({ message: `Payment ${status}`, payment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
