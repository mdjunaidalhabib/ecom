import SuperAdmin from "../models/SuperAdmin.js";

export const seedSuperAdmin = async () => {
  try {
    const exists = await SuperAdmin.findOne({ email: process.env.SA_EMAIL });
    if (exists) {
      console.log("✅ Super Admin already exists:", exists.email);
      return;
    }

    await SuperAdmin.create({
      name: process.env.SA_NAME || "Super Admin",
      email: process.env.SA_EMAIL,
      password: process.env.SA_PASSWORD,
    });

    console.log("🟢 Super Admin created:", process.env.SA_EMAIL);
  } catch (err) {
    console.error("❌ Super Admin seed failed:", err.message);
  }
};
