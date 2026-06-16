/**
 * db.js  — Multi-tenant MongoDB connection manager
 *
 * বিদ্যমান backend/src/lib/db.js এটা দিয়ে REPLACE করো।
 *
 * কীভাবে কাজ করে:
 *  - connectMasterDB()  → Master DB (Tenant list, plans, payments)
 *  - getTenantDB(dbName) → প্রতিটা Tenant এর আলাদা DB
 *  - Connection cache করা হয় — বারবার connect হয় না
 */

import mongoose from "mongoose";

// ─── Connection cache ──────────────────────────────────────────
const connections = new Map(); // dbName → mongoose.Connection

// ─── Master DB connection (Glorixbd-main default DB) ──────────
export const connectMasterDB = async () => {
  try {
    const uri   = process.env.MONGO_URI;
    const dbName = process.env.DB_NAME || "glorixbd_master";
    if (!uri) throw new Error("MONGO_URI missing");

    await mongoose.connect(uri, { dbName, serverSelectionTimeoutMS: 10000 });
    console.log("✅ Master DB connected:", dbName);
  } catch (err) {
    console.error("❌ Master DB error:", err.message);
    process.exit(1);
  }
};

// backward-compat default export (server.js calls dbConnect())
export default connectMasterDB;

// ─── Get or create a tenant DB connection ─────────────────────
export const getTenantDB = async (dbName) => {
  if (!dbName) throw new Error("dbName required");

  // Return cached live connection
  const cached = connections.get(dbName);
  if (cached && cached.readyState === 1) return cached;

  const baseUri = process.env.MONGO_BASE_URI
    || process.env.MONGO_URI?.replace(/\/[^/?]+(\?|$)/, "/$1") // strip existing db name
    || process.env.MONGO_URI;

  // Build URI with tenant dbName
  const uri = baseUri.includes("?")
    ? baseUri.replace("?", `/${dbName}?`)
    : `${baseUri.replace(/\/$/, "")}/${dbName}`;

  const conn = await mongoose
    .createConnection(uri, { serverSelectionTimeoutMS: 8000 })
    .asPromise();

  connections.set(dbName, conn);
  console.log("✅ Tenant DB connected:", dbName);
  return conn;
};

// ─── Clear a tenant connection from cache (e.g. after delete) ─
export const clearTenantConnection = (dbName) => {
  const conn = connections.get(dbName);
  if (conn) { conn.close(); connections.delete(dbName); }
};
