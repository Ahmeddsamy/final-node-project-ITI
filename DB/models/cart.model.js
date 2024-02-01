// Schema and Model
import mongoose from "mongoose";
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  totalPrice: Number,
  priceAfterDiscount: Number,
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      appliedCoupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        default: null,
      },
    },
  ],
});

const cartModel = mongoose.model("Cart", cartSchema);

export default cartModel;
