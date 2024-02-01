// Schema and Model

import mongoose from "mongoose";

let usersSchema = new mongoose.Schema({
  userName: String,
  email: String,
  password: String,
  Cpassword: String,
  phoneNumber: String,
  role: { type: String, default: "user" },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  addresses: [
    {
      street: String,
      city: String,
      country: String,
    },
  ],
});

const userModel = mongoose.model("User", usersSchema);

export default userModel;
