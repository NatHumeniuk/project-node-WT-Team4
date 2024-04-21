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

const updatePortion = async (req, res) => {
  const { _id: ownerId } = req.user;

  const { id, waterVolume, time } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Portion ID is required" });
  }

  const updateData = {};

  if (waterVolume !== undefined) {
    updateData["waterEntries.$.waterVolume"] = waterVolume;
  }

  if (time) {
    updateData["waterEntries.$.time"] = new Date(time);
  }

  const result = await waterServices.updatePortion(ownerId, updateData);

  if (!result) {
    throw HttpError(404, `Water entry not found`);
  }

  res.json(result);
};

const getTodayTracker = async (req, res) => {
  const { _id: owner } = req.user;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const filter = {
    owner,
    date: { $gte: today, $lt: tomorrow },
  };

  const result = await waterServices.todayTracker(filter);

  res.json(result);
};

export default {
  createPortion: ctrlWrapper(createPortion),
  updatePortion: ctrlWrapper(updatePortion),
  getTodayTracker: ctrlWrapper(getTodayTracker),
};
