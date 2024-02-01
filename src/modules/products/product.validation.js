import Joi from "joi";
export const addProductSchema = {
  body: Joi.object({
    productName: Joi.string().required(),
    slug: Joi.string().required(),
    priceAfterDiscount: Joi.number().required(),
    finalPrice: Joi.number().required(),
    // imageURL: Joi.string().required(),
    category: Joi.string().min(24).max(24).required(),
    couponApplied: Joi.string(),
    stock: Joi.number().min(1).required(),
  }),
};

export const updateProductSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    productName: Joi.string(),
    slug: Joi.string(),
    priceAfterDiscount: Joi.number(),
    finalPrice: Joi.number(),
    // imageURL: Joi.string(),
    category: Joi.string().min(24).max(24),
    couponApplied: Joi.string(),
    stock: Joi.number(),
  }).min(1),
};
