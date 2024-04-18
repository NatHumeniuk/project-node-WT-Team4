import Joi from "joi";

export const dailyWaterPortions = Joi.object({
  waterVolume: Joi.number().required().min(0).max(5000),
  time: Joi.date().required(),
});

export const dailySummarySchema = Joi.object({
  date: Joi.date().required(),
  dailyWaterNorm: Joi.number().required(),
  numberOfEntries: Joi.number().integer().required(),
});
