import Joi from "joi";
import { patternEmail } from "../constants/user-constants.js";

export const userSignupSchema = Joi.object({
  email: Joi.string().pattern(patternEmail).required().messages({
    "string.email":
      "Email must be a valid email format: john.doe123@example.com",
  }),
  password: Joi.string().min(8).max(64).required(),
});

export const userEmailSchema = Joi.object({
  email: Joi.string().pattern(patternEmail).required(),
});

export const userSigninSchema = Joi.object({
  email: Joi.string().pattern(patternEmail).required().messages({
    "string.email":
      "Email must be a valid email format: john.doe123@example.com",
  }),
  password: Joi.string().min(8).max(64).required(),
});

export const userUpdSchema = Joi.object({
  username: Joi.string(),
  email: Joi.string().pattern(patternEmail).messages({
    "string.email":
      "Email must be a valid email format: john.doe123@example.com",
  }),
  gender: Joi.string().valid("Woman", "Man"),
  password: Joi.string().min(8).max(64),
  passwordNew: Joi.string().min(8).max(64),
  dailyWaterNorm: Joi.number().min(1).max(15000),
});
