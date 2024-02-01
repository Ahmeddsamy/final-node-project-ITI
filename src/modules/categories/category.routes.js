import express from "express";
import { auth } from "../../middleware/auth.js";

import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getCategoryByName,
  updateCategory,
} from "./controller/category.controller.js";
import { upload } from "../../middleware/images.js";

const categoryRoutes = express.Router();
categoryRoutes.post("/category", upload.single("image"), auth, addCategory);
categoryRoutes.patch(
  "/category/:id",
  upload.single("image"),
  auth,
  updateCategory
);
categoryRoutes.delete("/category/:id", auth, deleteCategory);
categoryRoutes.get("/category", getAllCategories);
categoryRoutes.get("/category/:categoryName", getCategoryByName);

export default categoryRoutes;
