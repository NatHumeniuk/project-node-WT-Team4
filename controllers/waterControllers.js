import HttpError from "../helpers/HttpError.js";

import * as waterServices from "../services/waterServices.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

const createPortion = async (req, res) => {
  const ownerId = req.user._id;
  const dailyWaterNorm = req.user.dailyWaterNorm;

  const waterData = req.body;
  if (!waterData) {
    return res
      .status(400)
      .json({ message: "Water portion and time is required" });
  }

  const result = await waterServices.addPortionWater(
    ownerId,
    waterData,
    dailyWaterNorm
  );

  const lastEntry = result.waterEntries[result.waterEntries.length - 1];

  const response = {
    time: lastEntry.time,
    waterVolume: lastEntry.waterVolume,
    _id: lastEntry._id,
  };

  res.status(200).json(response);
};

export default {
  createPortion: ctrlWrapper(createPortion),
};
