import Joi from "joi";
import { patternDate } from "../constants/date-constants.js";

export const dailyWaterPortions = Joi.object({
  date: Joi.string()
    .pattern(patternDate)
    .required()
    .custom((data) => {
      const date = new Date(data);
      return date;
    }),
  waterVolume: Joi.number().required().min(0).max(5000),
  time: Joi.string()
    .pattern(patternDate)
    .required()
    .custom((data) => {
      const time = new Date(data);
      return time;
    }),
});

export const updDailyWaterPortions = Joi.object({
  id: Joi.object(),
  waterVolume: Joi.number(),
  time: Joi.string()
    .pattern(patternDate)
    .custom((data) => {
      const time = new Date(data);
      return time;
    }),
});
