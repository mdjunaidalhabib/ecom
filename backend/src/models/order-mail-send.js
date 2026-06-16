import mongoose from "mongoose";

const OrderMailSendSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    emails: [
      {
        email: { type: String, required: true },
        active: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.OrderMailSend ||
  mongoose.model("OrderMailSend", OrderMailSendSchema);
