import express from "express";

import authenticate from "../middlewares/authenticate.js";
import validateBody from "../decorators/validatorBody.js";
import { dailyWaterPortions } from "../schemas/waterSchemas.js";
import waterControllers from "../controllers/waterControllers.js";

const waterRouter = express.Router();

waterRouter.use(authenticate);

waterRouter.post(
  "/",
  validateBody(dailyWaterPortions),
  waterControllers.createPortion
);

export default waterRouter;
