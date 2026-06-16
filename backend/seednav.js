// seednav.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Navbar from "./src/models/Navbar.js";

dotenv.config(); // .env থেকে MONGO_URI নেবে

// ✅ Seed data
const navbarData = {
  brand: {
    name: "Habib's Fashion",
    logo: "https://res.cloudinary.com/demo/image/upload/v1234567890/habib_logo.png",
  },
  updatedAt: new Date(),
};

// ✅ Seed Function
async function seedNavbar() {
  try {
    // MongoDB Atlas connect
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas");

    // পুরনো ডাটা মুছে ফেলা (যদি থাকে)
    await Navbar.deleteMany();

    // নতুন ডাটা ইনসার্ট
    await Navbar.create(navbarData);

    console.log("🌱 Navbar data seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

// Run function
seedNavbar();
