import categoryModel from "../../../../DB/models/category.model.js";
import userModel from "../../../../DB/models/user.model.js";

// Add Category
export const addCategory = async (req, res) => {
  try {
    const newCategory = new categoryModel({
      ...req.body,
      imageURL: req.file.path,
      createdBy: req.userID,
    });
    await newCategory.save();

    return res
      .status(201)
      .json({ message: "Category Added Successfully", newCategory });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to add a new category" });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userID;

    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const user = await userModel.findById(userId);
    if (
      !(
        user &&
        (user.role === "admin" || category.createdBy.toString() === userId)
      )
    ) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Update category fields
    category.categoryName = req.body.categoryName;

    // Check if a new image file is uploaded
    if (req.file) {
      category.imageURL = req.file.path; // If a new image is uploaded, update the imageURL
    }

    await category.save();
    return res
      .status(200)
      .json({ message: "Category Modified Successfully", category });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update the category" });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.userID;

    const category = await categoryModel.findById(id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const user = await userModel.findById(userId);

    if (
      !user ||
      (user.role !== "admin" && category.createdBy.toString() !== userId)
    ) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "Category deleted successfully", deletedCategory });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete the category" });
  }
};

// Get All Categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find();
    return res
      .status(200)
      .json({ message: "Here are all the categories", categories });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Get Specific Category
export const getCategoryByName = async (req, res) => {
  try {
    const { categoryName } = req.params;
    const category = await categoryModel.findOne({ categoryName });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch the category" });
  }
};
