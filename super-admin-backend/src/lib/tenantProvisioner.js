import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

// ─── URI builder: MONGO_BASE_URI তে dbName যোগ করে ─────────
const buildTenantUri = (dbName) => {
  const base = process.env.MONGO_BASE_URI;
  if (!base) throw new Error("MONGO_BASE_URI missing in .env");

  // base URI যদি ? থাকে: .../?ssl=true → .../dbName?ssl=true
  // base URI যদি ? না থাকে: .../   → .../dbName
  if (base.includes("?")) {
    // e.g. mongodb://user:pass@host/?ssl=true&...
    return base.replace("/?", `/${dbName}?`);
  }
  return `${base.replace(/\/$/, "")}/${dbName}`;
};

export const provisionTenantDB = async ({
  dbName,
  shopName,
  ownerName,
  ownerEmail,
  ownerPassword,
}) => {
  const uri = buildTenantUri(dbName);

  const conn = await mongoose
    .createConnection(uri, { serverSelectionTimeoutMS: 10000 })
    .asPromise();

  // ─── Admin ───────────────────────────────────────────────
  const adminSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true, lowercase: true },
      password: { type: String, required: true },
      role: { type: String, default: "admin" },
      status: { type: String, default: "active" },
      lastLoginAt: { type: Date },
      lastLoginIp: { type: String },
    },
    { timestamps: true },
  );

  // password hash pre-save
  adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

  adminSchema.methods.matchPassword = async function (entered) {
    return bcrypt.compare(entered, this.password);
  };

  const AdminModel = conn.models.Admin || conn.model("Admin", adminSchema);

  // pre-save hook নিজেই hash করবে, তাই plain password দিচ্ছি
  await AdminModel.create({
    name: ownerName,
    email: ownerEmail.toLowerCase().trim(),
    password: ownerPassword,
    role: "admin",
    status: "active",
  });

  // ─── Navbar seed ─────────────────────────────────────────
  const NavbarModel =
    conn.models.Navbar ||
    conn.model("Navbar", new mongoose.Schema({}, { strict: false }));
  await NavbarModel.create({ logo: "", links: [] });

  // ─── Footer seed ─────────────────────────────────────────
  const FooterModel =
    conn.models.Footer ||
    conn.model("Footer", new mongoose.Schema({}, { strict: false }));
  await FooterModel.create({
    shopName,
    address: "",
    phone: "",
    email: ownerEmail,
  });

  // ─── DeliveryCharge seed ──────────────────────────────────
  const DCModel =
    conn.models.DeliveryCharge ||
    conn.model("DeliveryCharge", new mongoose.Schema({}, { strict: false }));
  await DCModel.create({ insideDhaka: 60, outsideDhaka: 120 });

  await conn.close();
  console.log(`✅ Tenant DB seeded: ${dbName} | admin: ${ownerEmail}`);
};

export const provisionNewTenant = async (tenantData) => {
  const {
    dbName,
    shopName,
    ownerName,
    ownerEmail,
    ownerPassword,
    subdomain,
    customDomain,
  } = tenantData;

  // DB seed সবসময় করবে
  await provisionTenantDB({
    dbName,
    shopName,
    ownerName,
    ownerEmail,
    ownerPassword,
  });

  // Nginx শুধু Linux production এ করবে
  if (process.platform === "win32" || process.env.NODE_ENV !== "production") {
    console.log(
      `⚠️ Nginx skipped (dev mode) — manual setup needed for: ${subdomain || customDomain}`,
    );
    return;
  }

  try {
    const rootDomain = process.env.ROOT_DOMAIN || "glorixbd.com";
    const frontendPort = process.env.TENANT_FRONTEND_PORT || 3000;
    const backendPort = process.env.PORT || 4000;
    const adminPort = process.env.ADMIN_PORT || 3012;
    const domains = [];
    if (subdomain) domains.push(`${subdomain}.${rootDomain}`);
    if (customDomain) domains.push(customDomain);
    if (!domains.length) return;

    const serverName = domains.join(" ");
    const filename = `glorixbd-${subdomain || customDomain?.replace(/\./g, "-")}`;
    const nginxDir =
      process.env.NGINX_SITES_DIR || "/etc/nginx/sites-available";
    const enabledDir =
      process.env.NGINX_ENABLED_DIR || "/etc/nginx/sites-enabled";

    const config = `# Auto-generated — ${serverName}
server {
    listen 80;
    server_name ${serverName};
    location / {
        proxy_pass http://localhost:${frontendPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
    location /api/ {
        proxy_pass http://localhost:${backendPort}/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Cookie $http_cookie;
    }
    location /admin {
        proxy_pass http://localhost:${adminPort};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`;

    const configPath = path.join(nginxDir, filename);
    const enabledPath = path.join(enabledDir, filename);
    await fs.writeFile(configPath, config, "utf8");
    try {
      await fs.unlink(enabledPath);
    } catch {}
    await fs.symlink(configPath, enabledPath);
    await execAsync("nginx -t");
    await execAsync("systemctl reload nginx");
    console.log(`✅ Nginx configured for: ${serverName}`);
  } catch (err) {
    console.warn("⚠️ Nginx config failed (manual setup needed):", err.message);
  }
};

export const deprovisionTenant = async ({
  dbName,
  subdomain,
  customDomain,
}) => {
  try {
    const uri = buildTenantUri(dbName);
    const conn = await mongoose
      .createConnection(uri, { serverSelectionTimeoutMS: 8000 })
      .asPromise();
    await conn.dropDatabase();
    await conn.close();
    console.log(`🗑️ Tenant DB dropped: ${dbName}`);
  } catch (err) {
    console.warn("DB drop failed:", err.message);
  }

  if (process.env.NODE_ENV === "production") {
    try {
      const nginxDir =
        process.env.NGINX_SITES_DIR || "/etc/nginx/sites-available";
      const enabledDir =
        process.env.NGINX_ENABLED_DIR || "/etc/nginx/sites-enabled";
      const filename = `glorixbd-${subdomain || customDomain?.replace(/\./g, "-")}`;
      await fs.unlink(path.join(enabledDir, filename)).catch(() => {});
      await fs.unlink(path.join(nginxDir, filename)).catch(() => {});
      await execAsync("systemctl reload nginx");
    } catch {}
  }
};
