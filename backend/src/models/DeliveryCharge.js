import mongoose from "mongoose";

const deliveryChargeSchema = new mongoose.Schema(
  {
    fee: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("DeliveryCharge", deliveryChargeSchema);
