/**
 * frontend/src/app/api/tenant-config/route.js
 *
 * এই file টা বিদ্যমান frontend এ যোগ করো।
 * Frontend এর layout.js এ tenant config load হবে এখান থেকে।
 *
 * কাজ: request এর Host দেখে Master DB থেকে tenant info আনে।
 */

import { NextResponse } from "next/server";
import mongoose from "mongoose";

let masterConn = null;
let TenantModel = null;

const getMasterConn = async () => {
  if (masterConn && masterConn.readyState === 1) return masterConn;

  masterConn = await mongoose
    .createConnection(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || "glorixbd_master",
      serverSelectionTimeoutMS: 5000,
    })
    .asPromise();

  return masterConn;
};

const getTenantModel = async () => {
  if (TenantModel) return TenantModel;
  const conn = await getMasterConn();

  const schema = new mongoose.Schema({
    shopName:     String,
    subdomain:    String,
    customDomain: String,
    status:       String,
    isLocked:     Boolean,
    planExpiryDate: Date,
    brandConfig: {
      primaryColor: String,
      logo:         String,
      favicon:      String,
    },
  });

  TenantModel = conn.modelNames().includes("Tenant")
    ? conn.model("Tenant")
    : conn.model("Tenant", schema);

  return TenantModel;
};

export async function GET(req) {
  try {
    const host       = req.headers.get("host") || "";
    const rootDomain = process.env.ROOT_DOMAIN || "glorixbd.com";
    const domain     = host.split(":")[0];

    let query;
    if (domain.endsWith(`.${rootDomain}`)) {
      query = { subdomain: domain.replace(`.${rootDomain}`, "") };
    } else if (domain !== rootDomain) {
      query = { customDomain: domain };
    } else {
      // Root domain — return default config
      return NextResponse.json({ isRoot: true });
    }

    const Model  = await getTenantModel();
    const tenant = await Model.findOne(query).select(
      "shopName status isLocked planExpiryDate brandConfig subdomain customDomain"
    ).lean();

    if (!tenant) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    if (tenant.isLocked || tenant.status === "suspended") {
      return NextResponse.json({ error: "suspended", shopName: tenant.shopName }, { status: 403 });
    }

    if (tenant.planExpiryDate && new Date(tenant.planExpiryDate) < new Date()) {
      return NextResponse.json({ error: "expired", shopName: tenant.shopName }, { status: 402 });
    }

    return NextResponse.json({
      shopName:     tenant.shopName,
      primaryColor: tenant.brandConfig?.primaryColor || "#000000",
      logo:         tenant.brandConfig?.logo || "",
      favicon:      tenant.brandConfig?.favicon || "",
      subdomain:    tenant.subdomain,
      customDomain: tenant.customDomain,
    });
  } catch (err) {
    console.error("tenant-config error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
