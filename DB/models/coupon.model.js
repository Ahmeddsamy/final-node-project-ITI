// Schema and Model
import mongoose from "mongoose";
const couponSchema = new mongoose.Schema({
  couponCode: String,
  value: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  expireIn: Date,
});

const couponModel = mongoose.model("Coupon", couponSchema);

export default couponModel;
