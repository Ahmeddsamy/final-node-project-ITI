import couponModel from "../../../../DB/models/coupon.model.js";
import userModel from "../../../../DB/models/user.model.js";

// Add Coupon
export const addCoupon = async (req, res) => {
  try {
    const newCoupon = new couponModel({
      ...req.body,
      createdBy: req.userID,
    });

    const savedCoupon = await newCoupon.save();

    return res
      .status(201)
      .json({ message: "Coupon Created Successfully", savedCoupon });
  } catch (error) {
    return res.status(500).json({ error: "Failed to add coupon" });
  }
};

// Update Coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.userID;

    // Check if the user is an admin or the creator of the coupon
    const user = await userModel.findById(userId);
    const coupon = await couponModel.findById(id);

    if (
      !(
        user &&
        (user.role === "admin" || coupon.createdBy.toString() === userId)
      )
    ) {
      return res.status(403).json({ error: "Permission denied" });
    }

    // Check if coupon is valid
    if (!coupon || coupon.deletedBy) {
      return res.status(400).json({ error: "Invalid or expired coupon code" });
    }

    // Update coupon fields including updatedBy
    req.body.updatedBy = userId; // Add the updatedBy field

    const updatedCoupon = await couponModel.findByIdAndUpdate(
      id,
      req.body,
      {
        updatedBy: userId,
      },
      {
        new: true,
      }
    );
    if (!updatedCoupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    return res.json({ message: "Coupon Updated Successfully", updatedCoupon });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update the coupon" });
  }
};

// Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.userID;

    // Check if the user is an admin or the creator of the coupon
    const user = await userModel.findById(userId);
    const coupon = await couponModel.findById(id);

    if (
      !(
        user &&
        (user.role === "admin" || coupon.createdBy.toString() === userId)
      )
    ) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const deletedCoupon = await couponModel.findByIdAndUpdate(
      id,
      {
        deletedBy: userId,
      },
      { new: true } // Return the updated document
    );
    if (!deletedCoupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    return res.json({ message: "Coupon deleted successfully", deletedCoupon });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete the coupon" });
  }
};

// Get All Coupons
export const getAllCoupons = async (req, res) => {
  try {
    // Retrieve all coupons from the database
    const coupons = await couponModel.find();

    // Return the list of coupons as a response
    return res.status(200).json({ message: "All Coupons Found", coupons });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch coupons" });
  }
};
