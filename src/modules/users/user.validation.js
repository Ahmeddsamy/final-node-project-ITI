import Joi from "joi";

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!$@#%&*])[A-Za-z\d!$@#%&*]{8,20}$/;

export const signUpSchema = {
  body: Joi.object({
    userName: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp(passwordPattern)).required(),
    Cpassword: Joi.string().valid(Joi.ref("password")).required(),
    phoneNumber: Joi.string().required(),
    addresses: Joi.array().items(
      Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        country: Joi.string(),
      })
    ),
  }),
};

export const signInSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export const changePasswordSchema = {
  body: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().pattern(new RegExp(passwordPattern)).required(),
    CNewPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }),
};

export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    newPassword: Joi.string().pattern(new RegExp(passwordPattern)).required(),
    CNewPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }),
};

export const updateUserSchema = {
  body: Joi.object({
    userName: Joi.string().alphanum().min(3).max(30),
    email: Joi.string().email(),
    role: Joi.string(),
    isVerified: Joi.boolean(),
    isActive: Joi.boolean(),
    addresses: Joi.array().items(
      Joi.object({
        street: Joi.string(),
        city: Joi.string(),
        country: Joi.string(),
      })
    ),
  }),
};
