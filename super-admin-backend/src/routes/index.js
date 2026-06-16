import express from "express";
import { loginSuperAdmin, logoutSuperAdmin, meSuperAdmin } from "../controllers/authController.js";
import {
  getAllTenants, getTenant, createTenant, updateTenant,
  extendPlan, toggleLock, deleteTenant, getDashboardStats,
} from "../controllers/tenantController.js";
import {
  addPayment, getAllPayments, updatePaymentStatus,
} from "../controllers/paymentController.js";
import { protectSuperAdmin } from "../middlewares/saAuth.js";

const router = express.Router();

// ─── Auth ─────────────────────────────────────────────────────
router.post("/auth/login", loginSuperAdmin);
router.post("/auth/logout", protectSuperAdmin, logoutSuperAdmin);
router.get("/auth/me", protectSuperAdmin, meSuperAdmin);

// ─── Dashboard ────────────────────────────────────────────────
router.get("/dashboard", protectSuperAdmin, getDashboardStats);

// ─── Tenants ─────────────────────────────────────────────────
router.get("/tenants", protectSuperAdmin, getAllTenants);
router.post("/tenants", protectSuperAdmin, createTenant);
router.get("/tenants/:id", protectSuperAdmin, getTenant);
router.put("/tenants/:id", protectSuperAdmin, updateTenant);
router.post("/tenants/:id/extend", protectSuperAdmin, extendPlan);
router.post("/tenants/:id/lock", protectSuperAdmin, toggleLock);
router.delete("/tenants/:id", protectSuperAdmin, deleteTenant);

// ─── Payments ────────────────────────────────────────────────
router.get("/payments", protectSuperAdmin, getAllPayments);
router.post("/payments", protectSuperAdmin, addPayment);
router.put("/payments/:id/status", protectSuperAdmin, updatePaymentStatus);

export default router;
