import mongoose from "mongoose";

const courierSettingSchema = new mongoose.Schema(
  {
    courier: {
      type: String,
      enum: ["steadfast", "pathao", "redx"],
      default: "steadfast",
    },
    merchantName: String,
    apiKey: String,
    secretKey: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CourierSetting =
  mongoose.models.CourierSetting ||
  mongoose.model("CourierSetting", courierSettingSchema);
export default CourierSetting;
