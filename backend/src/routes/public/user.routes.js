import express from "express";
import User from "../../models/User.js";

const router = express.Router();

/**
 * PUT /users/update
 * body: { userId, name, phone, address, city, country, avatar }
 */
router.put("/update", async (req, res) => {
  try {
    const { userId, name, phone, address, city, country, avatar } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await User.findOneAndUpdate(
      { userId: Number(userId) }, // userId is Number
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("❌ User update error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
