import express from "express";
import { auth } from "../../middleware/auth.js";
import {
  createOrder,
  getOrderDetails,
  getUserOrders,
} from "./controller/order.controller.js";

const orderRoutes = express.Router();
// Create an order
orderRoutes.post("/order", auth, createOrder);

// Get order details
orderRoutes.get("/order/:orderId", auth, getOrderDetails);
// Get order user
orderRoutes.get("/order", auth, getUserOrders);

export default orderRoutes;
