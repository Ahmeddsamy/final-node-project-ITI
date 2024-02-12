import cartModel from "../../../../DB/models/cart.model.js";
import categoryModel from "../../../../DB/models/category.model.js";
import couponModel from "../../../../DB/models/coupon.model.js";
import productModel from "../../../../DB/models/product.model.js";
import userModel from "../../../../DB/models/user.model.js";

// Add Product
export const addProduct = async (req, res) => {
  try {
    console.log(req.file);
    const newProduct = new productModel({
      ...req.body,
      imageURL: req.file.path,
      createdBy: req.userID,
    });
    await newProduct.save();
    return res
      .status(201)
      .json({ message: "Product Added Successfully", newProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to add a new product" });
  }
};
// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userID;

    // Check if the user is an admin or the creator of the product
    const user = await userModel.findById(userId);
    const product = await productModel.findById(id);

    if (
      !(
        user &&
        (user.role === "admin" || product.createdBy.toString() === userId)
      )
    ) {
      return res.status(403).json({ error: "Permission denied" });
    }
    // Prepare the update object
    let updateData = req.body;

    // Check if a new image is uploaded
    if (req.file) {
      updateData.imageURL = req.file.path; // Update the imageURL with the new file path
    }
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json({ message: "Product Update Successfully", updatedProduct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update the product" });
  }
};
// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.userID;

    // Check if the user is an admin or the creator of the product
    const user = await userModel.findById(userId);
    const product = await productModel.findById(id);

    if (
      !(
        user &&
        (user.role === "admin" || product.createdBy.toString() === userId)
      )
    ) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const deletedProduct = await productModel.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({
      message: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete the product" });
  }
};
// Get Products with Paginate
export const getAllProducts = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const totalProducts = await productModel.countDocuments();
    const products = await productModel
      .find()
      .skip(skip)
      .limit(pageSize)
      .exec();

    return res.json({ products, totalProducts });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};
// Get Specific Products with Slug
export const getProductBySlug = async (req, res) => {
  try {
    const { id } = req.params; // Use the ID from the request parameters

    // Use the ID to find the product
    const product = await productModel.findById(id); // Changed findOne({ slug }) to findById(id)

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    // It's a good idea to log the error for debugging purposes
    console.error("Failed to fetch the product:", error);
    return res.status(500).json({ error: "Failed to fetch the product" });
  }
};
// Get Products Under Same Category
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    // Find the category by categoryName
    const category = await categoryModel.findOne({ categoryName });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Use the category's _id to query products
    const products = await productModel.find({ category: category._id });

    return res.json(products);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch products in the category" });
  }
};

// Apply Coupon to Product
export const applyCouponToProduct = async (req, res) => {
  try {
    const { productId, couponCode } = req.body;
    const userId = req.userID;

    // Find the product by ID
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if the user has already applied this coupon to the product
    const user = await userModel.findById(userId);
    const cart = await cartModel.findOne({ userId });

    const appliedCouponIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId && item.appliedCoupon
    );

    if (appliedCouponIndex !== -1) {
      return res
        .status(400)
        .json({ error: "Coupon already applied to this product" });
    }

    // Check if the coupon is valid and available
    const coupon = await couponModel.findOne({ couponCode });

    if (!coupon || coupon.expireIn < new Date() || coupon.deletedBy) {
      return res.status(400).json({ error: "Invalid or expired coupon code" });
    }

    // Calculate the discount amount based on coupon value
    const discountAmount = coupon.value;

    // Apply the discount to the product's final price for the user
    product.finalPrice -= discountAmount;

    // Update the user's cart with the updated product price
    const updatedCart = cart;
    const updatedProductIndex = updatedCart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (updatedProductIndex !== -1) {
      updatedCart.products[updatedProductIndex].appliedCoupon = coupon._id;
    }

    // Recalculate totalPrice and priceAfterDiscount for the cart
    let priceAfterDiscount = cart.totalPrice;

    for (const cartProduct of updatedCart.products) {
      if (cartProduct.appliedCoupon) {
        const coupon = await couponModel.findById(cartProduct.appliedCoupon);
        if (coupon) {
          priceAfterDiscount -= coupon.value;
        }
      }
    }

    updatedCart.priceAfterDiscount = priceAfterDiscount;

    // Save the updated cart to the database
    await updatedCart.save();

    res.status(200).json({ message: "Coupon applied successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to apply coupon" });
  }
};
