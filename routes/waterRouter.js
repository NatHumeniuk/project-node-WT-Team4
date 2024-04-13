import express from "express";

import isValidId from "../middlewares/isValidId.js";
import authenticate from "../middlewares/authenticate.js";
import validateBody from "../decorators/validatorBody.js";

const waterRouter = express.Router();

waterRouter.use(authenticate);

export default waterRouter;
