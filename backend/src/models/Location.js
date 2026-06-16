import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  division: { type: String, required: true },
  district: { type: String, required: true },
  thana: { type: String, required: true },
});

export default mongoose.models.Location ||
  mongoose.model("Location", locationSchema);
