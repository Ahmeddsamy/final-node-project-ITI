import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: String,
  slug: String,
  priceAfterDiscount: Number,
  finalPrice: Number,
  imageURL: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  couponApplied: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
  stock: Number,
});

const productModel = mongoose.model("Product", productSchema);

export default productModel;
