import express from "express";
import { auth } from "../../middleware/auth.js";
import {
  addProduct,
  applyCouponToProduct,
  deleteProduct,
  getAllProducts,
  getProductBySlug,
  getProductsByCategory,
  updateProduct,
} from "./controller/product.controller.js";
import { validation } from "../../middleware/validation.js";
import { addProductSchema, updateProductSchema } from "./product.validation.js";
import { upload } from "../../middleware/images.js";

const productRoutes = express.Router();
productRoutes.post(
  "/product",
  upload.single("image"),
  auth,
  validation(addProductSchema),
  addProduct
);
productRoutes.patch(
  "/product/:id",
  upload.single("image"),
  auth,
  validation(updateProductSchema),
  updateProduct
);
productRoutes.delete("/product/:id", auth, deleteProduct);
productRoutes.get("/product", getAllProducts);
productRoutes.get("/product/category/:categoryName", getProductsByCategory);
productRoutes.get("/product/:id", getProductBySlug);
productRoutes.post("/product/applycoupon", auth, applyCouponToProduct);
export default productRoutes;
