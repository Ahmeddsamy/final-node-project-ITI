import userModel from "../../../../DB/models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  sendPasswordResetMail,
  sendVerificationMail,
} from "../../../services/sendEmail.js";

// Sign Up a New User
export const signUp = async (req, res) => {
  try {
    const { userName, email, password, Cpassword, addresses, phoneNumber } =
      req.body;

    if (password !== Cpassword) {
      return res.status(400).send("Passwords do not match");
    }
    let foundUserEmail = await userModel.findOne({ email: req.body.email });
    if (foundUserEmail) {
      res.json({ message: "user email already registered" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new userModel({
        userName,
        email,
        phoneNumber,
        password: hashedPassword,
        addresses,
      });
      let token = jwt.sign({ id: newUser._id }, "NewUser");
      let url = `https://ahmed-samy-node-project-iti.onrender.com/user/verify/${token}`;
      await sendVerificationMail(email, url);
      await newUser.save();
      res.status(201).json({ message: "User created successfully", newUser });
    }
  } catch (error) {
    res.status(500).send("Error in signup");
    console.error(error);
  }
};

// User Verification
export const verifyAccount = (req, res) => {
  let { token } = req.params;
  jwt.verify(token, "NewUser", async (err, decoded) => {
    let userFound = await userModel.findById(decoded.id);
    if (!userFound) return res.json({ message: "invalid user" });
    let updatedUser = await userModel.findByIdAndUpdate(
      decoded.id,
      { isVerified: true },
      { new: true }
    );
    res.json({ message: "User Verified", updatedUser });
  });
};

// Sign in
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send("You need to register first");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send("Invalid credentials");
    }
    if (!user.isActive) {
      return res.status(400).send("Account Deactivated");
    }
    if (!user.isVerified)
      return res.json({ message: "please verify your account first" });
    const token = jwt.sign({ id: user._id }, "ITI", { expiresIn: "1h" });
    res.status(200).json({ message: "Welcome Home", token });
  } catch (error) {
    res.status(500).send("Error in signin");
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, CNewPassword } = req.body;

    // Find the current user
    const user = await userModel.findById(req.userID);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).send("Invalid old password");
    }

    // Check if new password and confirm new password match
    if (newPassword !== CNewPassword) {
      return res.status(400).send("New passwords do not match");
    }

    // Hash and set new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.status(200).send("Password reset successfully");
  } catch (error) {
    res.status(500).send("Error in resetting password");
  }
};

// Update User Data (Admin Only)
export const updateUser = async (req, res) => {
  try {
    const userToUpdate = await userModel.findById(req.params.id);
    const requestingUser = await userModel.findById(req.userID);

    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).send("Unauthorized");
    }

    Object.assign(userToUpdate, req.body);
    await userToUpdate.save();

    res
      .status(200)
      .json({ message: "User updated successfully", userToUpdate });
  } catch (error) {
    res.status(500).send("Error in updating user");
  }
};

// Forget Password
export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).send("User not found");
  }

  let token = jwt.sign({ id: user._id }, "ResetPassword", { expiresIn: "1h" });
  let url = `https://ahmed-samy-node-project-iti.onrender.com/user/resetpassword/${token}`;
  sendPasswordResetMail(email, url);
  res.send("Password reset email sent");
};

// Reset Password
export const resetPassword = async (req, res) => {
  let { token } = req.params;
  jwt.verify(token, "ResetPassword", async (err, decoded) => {
    if (err) {
      return res.status(400).send("Invalid or expired token");
    }

    const { password, Cpassword } = req.body;

    // Check if passwords match
    if (password !== Cpassword) {
      return res.status(400).send("Passwords do not match");
    }

    try {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update the user's password in the database
      await userModel.findByIdAndUpdate(decoded.id, {
        password: hashedPassword,
      });

      res.send("Password reset successfully");
    } catch (error) {
      res.status(500).send("Error in resetting password");
    }
  });
};

// Deactivate User
export const deactivateUser = async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.userID, { isActive: false });
    res.status(200).send("User deactivated successfully");
  } catch (error) {
    res.status(500).send("Error in deactivating user");
  }
};
