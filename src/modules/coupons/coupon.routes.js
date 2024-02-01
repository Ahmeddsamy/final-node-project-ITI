import express from "express";
import { auth } from "../../middleware/auth.js";
import {
  addCoupon,
  deleteCoupon,
  getAllCoupons,
  updateCoupon,
} from "./controller/coupon.controller.js";

const couponRoutes = express.Router();
couponRoutes.post("/coupon", auth, addCoupon);
couponRoutes.patch("/coupon/:id", auth, updateCoupon);
couponRoutes.delete("/coupon/:id", auth, deleteCoupon);
couponRoutes.get("/coupon", getAllCoupons);

export default couponRoutes;
