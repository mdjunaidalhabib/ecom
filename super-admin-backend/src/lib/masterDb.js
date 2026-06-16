import mongoose from "mongoose";

const connectMasterDB = async () => {
  try {
    const uri = process.env.MASTER_MONGO_URI;
    const dbName = process.env.MASTER_DB_NAME || "glorixbd_master";

    if (!uri) throw new Error("MASTER_MONGO_URI is missing in .env");

    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ Master DB Connected:", dbName);
  } catch (err) {
    console.error("❌ Master DB Connection Error:", err.message);
    process.exit(1);
  }
};

export default connectMasterDB;
