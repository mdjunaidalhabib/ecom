import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  totalVisitors: { type: Number, default: 0 },
  todayVisitors: { type: Number, default: 0 },
  mobile: { type: Number, default: 0 },
  desktop: { type: Number, default: 0 },
  lastReset: { type: Date, default: Date.now },
});

export default mongoose.model("Analytics", analyticsSchema);
