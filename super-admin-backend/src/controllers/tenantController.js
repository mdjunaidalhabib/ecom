import mongoose from "mongoose";
import Tenant from "../models/Tenant.js";
import Payment from "../models/Payment.js";
import { provisionNewTenant, deprovisionTenant } from "../lib/tenantProvisioner.js";

// ─── Helper: generate unique DB name ─────────────────────────
const generateDbName = (subdomain) => {
  const rand = Math.random().toString(36).substring(2, 7);
  return `tenant_${subdomain}_${rand}`;
};

// ─── Get all tenants ──────────────────────────────────────────
export const getAllTenants = async (req, res) => {
  try {
    const { status, plan, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (plan) filter.plan = plan;
    if (search) {
      filter.$or = [
        { shopName: { $regex: search, $options: "i" } },
        { ownerEmail: { $regex: search, $options: "i" } },
        { subdomain: { $regex: search, $options: "i" } },
      ];
    }

    await Tenant.updateMany(
      { planExpiryDate: { $lt: new Date() }, status: "active" },
      { status: "expired", isLocked: true },
    );

    const total = await Tenant.countDocuments(filter);
    const tenants = await Tenant.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-__v");

    res.json({
      tenants,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Get tenants error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Get single tenant ────────────────────────────────────────
export const getTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const payments = await Payment.find({ tenant: tenant._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ tenant, payments });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Create tenant ────────────────────────────────────────────
export const createTenant = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      ownerEmail,
      ownerPhone,
      plan,
      durationDays,
      notes,
    } = req.body;

    // empty string হলে undefined করো — sparse index এর জন্য
    const subdomain = req.body.subdomain?.trim() || undefined;
    const customDomain = req.body.customDomain?.trim() || undefined;

    if (!subdomain && !customDomain) {
      return res
        .status(400)
        .json({ message: "Subdomain or custom domain required" });
    }

    // Check duplicates
    if (subdomain) {
      const exists = await Tenant.findOne({ subdomain });
      if (exists)
        return res.status(400).json({ message: "Subdomain already taken" });
    }
    if (customDomain) {
      const exists = await Tenant.findOne({ customDomain });
      if (exists)
        return res.status(400).json({ message: "Custom domain already taken" });
    }

    const dbName = generateDbName(subdomain || customDomain.split(".")[0]);
    const planStart = new Date();
    const planExpiry = new Date();
    planExpiry.setDate(planExpiry.getDate() + (Number(durationDays) || 30));

    const ownerPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-4).toUpperCase() +
      "!";

    const tenant = await Tenant.create({
      shopName,
      ownerName,
      ownerEmail,
      ownerPhone,
      subdomain, // undefined হলে MongoDB save করবে না
      customDomain, // undefined হলে MongoDB save করবে না
      dbName,
      plan: plan || "basic",
      planStartDate: planStart,
      planExpiryDate: planExpiry,
      status: "active",
      isLocked: false,
      notes,
      createdBy: req.superAdmin._id,
    });

    // Provision: DB seed + Nginx config
    try {
      await provisionNewTenant({
        dbName,
        shopName,
        ownerName,
        ownerEmail,
        ownerPassword,
        subdomain,
        customDomain,
      });
    } catch (provisionErr) {
      await Tenant.findByIdAndDelete(tenant._id);
      console.error(
        "Provision failed, rolled back tenant:",
        provisionErr.message,
      );
      return res.status(500).json({
        message: "Shop creation failed during setup. Please try again.",
        detail: provisionErr.message,
      });
    }

    const rootDomain = process.env.ROOT_DOMAIN || "glorixbd.com";
    const adminUrl = subdomain
      ? `http://${subdomain}.${rootDomain}/admin`
      : `http://${customDomain}/admin`;

    res.status(201).json({
      message: "Tenant created",
      tenant,
      credentials: {
        adminUrl,
        email: ownerEmail,
        password: ownerPassword,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    console.error("Create tenant error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Update tenant ────────────────────────────────────────────
export const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const allowed = [
      "shopName",
      "ownerName",
      "ownerPhone",
      "plan",
      "planExpiryDate",
      "status",
      "isLocked",
      "lockReason",
      "autoRenew",
      "notes",
      "brandConfig",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) tenant[field] = req.body[field];
    });

    await tenant.save();
    res.json({ message: "Tenant updated", tenant });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Extend plan ──────────────────────────────────────────────
export const extendPlan = async (req, res) => {
  try {
    const { durationDays, plan } = req.body;
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const base =
      tenant.planExpiryDate && tenant.planExpiryDate > new Date()
        ? tenant.planExpiryDate
        : new Date();

    tenant.planExpiryDate = new Date(base);
    tenant.planExpiryDate.setDate(
      tenant.planExpiryDate.getDate() + Number(durationDays),
    );

    if (plan) tenant.plan = plan;
    if (!tenant.planStartDate) tenant.planStartDate = new Date();
    tenant.status = "active";
    tenant.isLocked = false;

    await tenant.save();
    res.json({ message: "Plan extended", tenant });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Lock / unlock ────────────────────────────────────────────
export const toggleLock = async (req, res) => {
  try {
    const { lock, reason } = req.body;
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    tenant.isLocked = !!lock;
    tenant.lockReason = lock ? reason || "Locked by super admin" : null;
    if (!lock && tenant.status === "suspended") tenant.status = "active";
    if (lock) tenant.status = "suspended";

    await tenant.save();
    res.json({ message: lock ? "Tenant locked" : "Tenant unlocked", tenant });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Delete tenant ────────────────────────────────────────────
export const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    await Payment.deleteMany({ tenant: tenant._id });

    // ✅ FIX: Tenant DB এবং Nginx config delete করো
    deprovisionTenant({
      dbName: tenant.dbName,
      subdomain: tenant.subdomain,
      customDomain: tenant.customDomain,
    }).catch((err) => console.warn("Deprovision warning:", err.message));

    res.json({ message: "Tenant deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── Dashboard stats ──────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const [total, active, expired, suspended, pendingPayments] =
      await Promise.all([
        Tenant.countDocuments(),
        Tenant.countDocuments({ status: "active" }),
        Tenant.countDocuments({ status: "expired" }),
        Tenant.countDocuments({ status: "suspended" }),
        Payment.countDocuments({ status: "pending" }),
      ]);

    const revenue = await Payment.aggregate([
      { $match: { status: "verified" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const expiringSoon = await Tenant.find({
      status: "active",
      planExpiryDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    }).select("shopName subdomain customDomain planExpiryDate planDaysLeft");

    res.json({
      stats: { total, active, expired, suspended, pendingPayments },
      totalRevenue: revenue[0]?.total || 0,
      expiringSoon,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
