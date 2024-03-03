import cartModel from "../../../../DB/models/cart.model.js";
import couponModel from "../../../../DB/models/coupon.model.js";
import productModel from "../../../../DB/models/product.model.js";
import userModel from "../../../../DB/models/user.model.js";
// Create Cart
export const createCart = async (req, res) => {
  try {
    const newCart = new cartModel({
      userId: req.userID,
      // other initial values
    });
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Update Cart
export const updateCart = async (req, res) => {
  try {
    const userId = req.userID;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the cart by userId
    let cart = await cartModel
      .findOne({ userId })
      .populate("products.productId");

    // If the cart does not exist, create a new one
    if (!cart) {
      cart = new cartModel({ userId });
    }

    // Check if the user is admin or the owner of the cart
    if (user.role !== "admin" && userId !== cart.userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this cart" });
    }

    // Merge existing products with new ones
    const newProducts = req.body.products;
    const existingProducts = cart.products.reduce((acc, item) => {
      acc[item.productId._id.toString()] = item;
      return acc;
    }, {});

    for (const newItem of newProducts) {
      const productId = newItem.productId.toString();
      if (existingProducts[productId]) {
        // Update quantity if product already exists
        existingProducts[productId].quantity += newItem.quantity;
      } else {
        // Add new product if it doesn't exist
        existingProducts[productId] = newItem;
      }
    }

    cart.products = Object.values(existingProducts);

    // Recalculate totalPrice
    let totalPrice = 0;

    for (const item of cart.products) {
      const product = await productModel.findById(item.productId);
      totalPrice += product.finalPrice * item.quantity;
      cart.totalPrice = totalPrice;
    }

    // Check if there are any coupons applied to products in the cart and subtract their values
    for (const item of cart.products) {
      if (item.appliedCoupon) {
        const coupon = await couponModel.findById(item.appliedCoupon);
        if (coupon) {
          totalPrice -= coupon.value; // Subtract coupon value for each item
        }
      }
    }

    // Set priceAfterDiscount as totalPrice after applying coupons

    cart.priceAfterDiscount = totalPrice;

    await cart.save();
    res.status(200).json({ message: "Cart Updated Successfully", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Apply Coupon
export const applyCouponToCart = async (req, res) => {
  try {
    const userId = req.userID;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the cart by userId
    let cart = await cartModel.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if the user is admin or the owner of the cart
    if (user.role !== "admin" && userId !== cart.userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to apply coupon to this cart" });
    }

    // Check if a coupon is already applied to the cart
    if (cart.couponId || cart.totalPrice != cart.priceAfterDiscount) {
      return res
        .status(400)
        .json({ message: "A coupon has already been applied to this cart" });
    }

    // Fetch the coupon and apply it
    const { couponCode } = req.body;
    const coupon = await couponModel.findOne({ couponCode });

    // Check if coupon is valid and not expired
    if (!coupon || coupon.expireIn < new Date() || coupon.deletedBy) {
      return res.status(400).json({ error: "Invalid or expired coupon code" });
    }

    // Apply the coupon
    cart.couponId = coupon._id;
    cart.priceAfterDiscount = cart.totalPrice - coupon.value;

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User Cart
// Get Current User Cart
export const getCurrentUserCart = async (req, res) => {
  try {
    const userId = req.userID; // Assuming userID is set in the request, similar to your other controllers

    // Find the user to ensure they exist
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the cart by userId
    const cart = await cartModel
      .findOne({ userId })
      .populate({
        path: "products.productId",
        model: "Product", // Ensure this matches your Product model name
      })
      .populate("couponId", "Coupon"); // Populate the couponId field if necessary

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Return the found cart to the client
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
