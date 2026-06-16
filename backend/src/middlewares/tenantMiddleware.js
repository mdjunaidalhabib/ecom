import mongoose from "mongoose";

// ─── In-memory tenant cache (5 min TTL) ───────────────────────
const tenantCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;
const connCache = new Map(); // dbName → mongoose.Connection

// ─── Master DB connection (singleton) ─────────────────────────
let masterConn = null;
const getMasterConn = async () => {
  if (masterConn && masterConn.readyState === 1) return masterConn;

  const base = process.env.MONGO_BASE_URI || process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || "glorixbd_sp";
  if (!base) throw new Error("MONGO_BASE_URI or MONGO_URI missing");

  // URI তে dbName explicitly inject করো
  const uri = base.includes("?")
    ? base.replace("/?", `/${dbName}?`)
    : `${base.replace(/\/$/, "")}/${dbName}`;

  masterConn = await mongoose
    .createConnection(uri, { serverSelectionTimeoutMS: 5000 })
    .asPromise();

  return masterConn;
};

// ─── Lazy Tenant mongoose model ───────────────────────────────
const getTenantModel = async () => {
  const conn = await getMasterConn();
  if (conn.modelNames().includes("Tenant")) return conn.model("Tenant");

  const schema = new mongoose.Schema({
    subdomain: String,
    customDomain: String,
    dbName: String,
    status: String,
    isLocked: Boolean,
    lockReason: String,
    planExpiryDate: Date,
  });
  return conn.model("Tenant", schema);
};

// ─── Tenant DB connection ─────────────────────────────────────
const getTenantConn = async (dbName) => {
  const cached = connCache.get(dbName);
  if (cached && cached.readyState === 1) return cached;

  const base = process.env.MONGO_BASE_URI;
  if (!base) throw new Error("MONGO_BASE_URI missing");

  // URI build: base এ ? থাকলে /?... → /dbName?...
  const uri = base.includes("?")
    ? base.replace("/?", `/${dbName}?`)
    : `${base.replace(/\/$/, "")}/${dbName}`;

  const conn = await mongoose
    .createConnection(uri, { serverSelectionTimeoutMS: 6000 })
    .asPromise();

  connCache.set(dbName, conn);
  return conn;
};

// ─── Extract identifier from request ──────────────────────────
// Priority order:
// 1. x-tenant-subdomain header (dev mode / admin panel)
// 2. Host header (production nginx)
// 3. x-forwarded-host header (reverse proxy)
const extractIdentifier = (req) => {
  const rootDomain = process.env.ROOT_DOMAIN || "glorixbd.com";

  // ✅ 1. Admin panel dev mode: x-tenant-subdomain header
  const xSubdomain = req.headers["x-tenant-subdomain"];
  if (xSubdomain && xSubdomain.trim()) {
    return { type: "subdomain", value: xSubdomain.trim().toLowerCase() };
  }

  // 2. Real Host header (production)
  const rawHost = req.headers.host || req.headers["x-forwarded-host"] || "";
  const host = rawHost.split(":")[0].toLowerCase();

  if (!host) return null;

  // subdomain: shop1.glorixbd.com → "shop1"
  if (host.endsWith(`.${rootDomain}`)) {
    return { type: "subdomain", value: host.replace(`.${rootDomain}`, "") };
  }

  // custom domain: myshop.com (root domain ও localhost বাদ)
  if (
    host !== rootDomain &&
    host !== `www.${rootDomain}` &&
    host !== "localhost"
  ) {
    return { type: "customDomain", value: host };
  }

  return null;
};

// ─── Main middleware ───────────────────────────────────────────
export const resolveTenant = async (req, res, next) => {
  const id = extractIdentifier(req);
  // Tenant identifier নেই → error দাও, default DB তে যাবে না
  if (!id) {
    // public routes (GET only) এ tenant লাগে না, skip করো
    const isPublicGet = req.method === "GET" && !req.path.startsWith("/admin");
    if (isPublicGet) return next();

    console.warn(
      "⚠️ resolveTenant: no tenant identifier found:",
      req.method,
      req.path,
    );
    return res.status(400).json({
      message: "Tenant identifier missing. x-tenant-subdomain header দাও।",
      code: "TENANT_IDENTIFIER_MISSING",
    });
  }

  const cacheKey = `${id.type}:${id.value}`;
  const now = Date.now();
  const cached = tenantCache.get(cacheKey);

  let tenant;
  if (cached && now - cached.at < CACHE_TTL_MS) {
    tenant = cached.tenant;
  } else {
    try {
      const TenantModel = await getTenantModel();
      tenant = await TenantModel.findOne({ [id.type]: id.value }).lean();
      tenantCache.set(cacheKey, { tenant, at: now });
    } catch (err) {
      console.error("Tenant lookup error:", err.message);
      return res.status(500).json({ message: "Server error" });
    }
  }

  if (!tenant) {
    return res
      .status(404)
      .json({ message: "Shop not found", code: "TENANT_NOT_FOUND" });
  }

  // Plan expiry auto-check
  if (tenant.planExpiryDate && new Date(tenant.planExpiryDate) < new Date()) {
    return res.status(402).json({
      message: "Subscription expired. Please renew your plan.",
      code: "TENANT_EXPIRED",
      expiredAt: tenant.planExpiryDate,
    });
  }

  if (tenant.isLocked || tenant.status === "suspended") {
    return res.status(403).json({
      message: "This shop has been suspended.",
      code: "TENANT_SUSPENDED",
      reason: tenant.lockReason || "Contact support",
    });
  }

  if (tenant.status === "pending") {
    return res
      .status(403)
      .json({ message: "Shop is pending activation.", code: "TENANT_PENDING" });
  }

  // Attach tenant DB connection to request
  try {
    req.tenantDb = await getTenantConn(tenant.dbName);
    req.tenant = tenant;
  } catch (err) {
    console.error("Tenant DB connect error:", err.message);
    return res
      .status(500)
      .json({ message: "Could not connect to shop database" });
  }

  next();
};

// ─── Cache invalidation ───────────────────────────────────────
export const invalidateTenantCache = (subdomain, customDomain) => {
  if (subdomain) tenantCache.delete(`subdomain:${subdomain}`);
  if (customDomain) tenantCache.delete(`customDomain:${customDomain}`);
};
