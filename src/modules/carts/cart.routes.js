import express from "express";
import { auth } from "../../middleware/auth.js";
import {
  applyCouponToCart,
  createCart,
  getCurrentUserCart,
  updateCart,
} from "./controller/cart.controller.js";

const cartRoutes = express.Router();
// Create cart
cartRoutes.post("/cart", auth, createCart);

// Update cart
cartRoutes.patch("/cart", auth, updateCart);

// Get User  cart
cartRoutes.get("/cart", auth, getCurrentUserCart);

// Apply coupon on cart
cartRoutes.post("/cart/applycoupon", auth, applyCouponToCart);

export default cartRoutes;
