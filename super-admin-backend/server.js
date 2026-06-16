import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import connectMasterDB from "./src/lib/masterDb.js";
import routes from "./src/routes/index.js";
import { seedSuperAdmin } from "./src/config/seedSuperAdmin.js";

dotenv.config();

const app = express();
const PORT = process.env.SA_PORT || 5001;

// ─── Required env check ───────────────────────────────────────
const required = ["MASTER_MONGO_URI", "SA_JWT_SECRET", "SA_EMAIL", "SA_PASSWORD"];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error("❌ Missing env:", missing.join(", "));
  process.exit(1);
}

// ─── Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.SA_PANEL_URL || "http://localhost:3001",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/sa", routes);

app.get("/health", (req, res) => res.json({ status: "ok", service: "super-admin-backend" }));

// ─── Start ────────────────────────────────────────────────────
connectMasterDB().then(async () => {
  await seedSuperAdmin();
  app.listen(PORT, () => {
    console.log(`🚀 Super Admin Backend running on port ${PORT}`);
  });
});
