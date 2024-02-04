import express from "express";
import { validation } from "../../middleware/validation.js";
import { auth } from "../../middleware/auth.js";
import {
  changePasswordSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updateUserSchema,
} from "./user.validation.js";
import {
  changePassword,
  deactivateUser,
  forgetPassword,
  resetPassword,
  signIn,
  signUp,
  updateUser,
  verifyAccount,
} from "./controller/user.controller.js";

const userRoutes = express.Router();

// Signup - Validation but no auth required
userRoutes.post("/signup", validation(signUpSchema), signUp);

// Signin - Validation but no auth required
userRoutes.post("/signin", validation(signInSchema), signIn);

// Verify - Validation but no auth required
userRoutes.post("/user/verify/:token", verifyAccount);

// Change Password - Validation and auth required
userRoutes.patch(
  "/changepassword",
  auth,
  validation(changePasswordSchema),
  changePassword
);

// Forget Password Email
userRoutes.post(
  "/forgetpassword",
  validation(forgetPasswordSchema),
  forgetPassword
);

// Reset Password
userRoutes.patch(
  "/user/resetpassword/:token",
  validation(resetPasswordSchema),
  resetPassword
);

// Update User - Auth required, validation
userRoutes.put(
  "/updateuser/:id",
  auth,
  validation(updateUserSchema),
  updateUser
);

// Deactivate User - Auth required, no body validation needed
userRoutes.patch("/deactivate", auth, deactivateUser);

export default userRoutes;
