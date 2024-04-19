import Joi from "joi";

export const dailyWaterPortions = Joi.object({
  waterVolume: Joi.number().required().min(0).max(5000),
  time: Joi.date().iso().required(),
});

export const dailySummarySchema = Joi.object({
  dailyWaterNorm: Joi.number().required(),
});
