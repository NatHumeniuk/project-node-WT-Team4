import Joi from "joi";
import { patternEmail } from "../constants/user-constants.js";

export const userSignupSchema = Joi.object({
  email: Joi.string().pattern(patternEmail).required(),
  password: Joi.string().min(8).max(64).required(),
});

export const userSigninSchema = Joi.object({
  email: Joi.string().pattern(patternEmail).required(),
  password: Joi.string().min(8).max(64).required(),
});

export const userUpdSchema = Joi.object({
  username: Joi.string(),
  email: Joi.string().pattern(patternEmail),
  password: Joi.string().min(8).max(64),
  avatarURL: Joi.string(),
});
