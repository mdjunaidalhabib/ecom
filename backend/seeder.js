import dotenv from "dotenv";
import { dbConnect } from "./src/lib/db.js";
import Product from "./src/models/Product.js";
import Category from "./src/models/Category.js";
import products from "../frontend/data/products.js";
import categories from "../frontend/data/categories.js";

dotenv.config(); // Load .env

// main seeder function
const importData = async () => {
  try {
    await dbConnect(process.env.MONGO_URI);

    // clear old data
    await Product.deleteMany();
    await Category.deleteMany();

    // insert new data
    await Product.insertMany(products);
    await Category.insertMany(categories);

    console.log("✅ Data Imported!");
    process.exit();
  } catch (err) {
    console.error("❌ Error importing data:", err.message);
    process.exit(1);
  }
};

// run seeder
importData();
