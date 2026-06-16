import dotenv from "dotenv";
import mongoose from "mongoose";
import Footer from "./src/models/Footer.js"; // ✅ default export আছে

dotenv.config();

const seedFooter = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // আগে পুরোনো footer ডিলিট
    await Footer.deleteMany({});

    // default footer create
    await Footer.create({
      brand: {
        title: "Habib's Fashion",
        logo: "/logo.png",
        about: "Your ultimate destination for the latest fashion items...",
      },
      socials: [
        { name: "Facebook", url: "https://facebook.com", icon: "FaFacebookF" },
        { name: "Instagram", url: "https://instagram.com", icon: "FaInstagram" },
      ],
      quickLinks: [
        { label: "Home", href: "/" },
        { label: "All Products", href: "/products" },
      ],
      categories: [
        { name: "Men", slug: "men" },
        { name: "Women", slug: "women" },
      ],
      contact: {
        address: "Jamalpur, Bangladesh",
        phone: "+8801788563988",
        email: "habibsfashion@gmail.com",
        website: "www.habibsfashion.com",
      },
      copyrightText:
        "© 2025 Habib's Fashion. All Rights Reserved.",
    });

    console.log("✅ Footer seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedFooter();
