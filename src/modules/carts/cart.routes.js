import express from "express";
import { auth } from "../../middleware/auth.js";
import {
  applyCouponToCart,
  createCart,
  updateCart,
} from "./controller/cart.controller.js";

const cartRoutes = express.Router();
// Create cart
cartRoutes.post("/cart", auth, createCart);

// Update cart
cartRoutes.patch("/cart", auth, updateCart);

// Apply coupon on cart
cartRoutes.post("/cart/applycoupon", auth, applyCouponToCart);

export default cartRoutes;
