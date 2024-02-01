import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  stripePaymentIntentId: String,
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
    },
  ],
  totalAmount: Number,
  address: {
    street: String,
    city: String,
    country: String,
  },
  paymentMethod: {
    type: String,
    enum: ["cashOnDelivery", "onlinePayment"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "preparing", "onTheWay", "completed", "cancelled"],
    default: "pending",
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
