import express from "express";

import authenticate from "../middlewares/authenticate.js";
import validateBody from "../decorators/validatorBody.js";
import isValidId from "../middlewares/isValidId.js";

import {
  dailyWaterPortions,
  updDailyWaterPortions,
} from "../schemas/waterSchemas.js";
import waterControllers from "../controllers/waterControllers.js";

const waterRouter = express.Router();

waterRouter.use(authenticate);

waterRouter.post(
  "/",
  validateBody(dailyWaterPortions),
  waterControllers.createPortion
);

waterRouter.patch(
  "/waterEntries/:id",

  validateBody(updDailyWaterPortions),
  waterControllers.updatePortion
);

waterRouter.delete(
  "/waterEntry/:id",

  waterControllers.deletePortion
);

waterRouter.get(
  "/today",

  waterControllers.getTodayTracker
);

waterRouter.get(
  "/month/:year/:month",

  waterControllers.getMonthTrackers
);

export default waterRouter;
