import HttpError from "../helpers/HttpError.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

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
  const id = ObjectId(req.params.id);

  const { _id: ownerId } = req.user;

  const { waterVolume, time } = req.body;

  const updateData = {};

  if (waterVolume !== undefined) {
    updateData["waterEntries.$.waterVolume"] = waterVolume;
  }

  if (time) {
    updateData["waterEntries.$.time"] = new Date(time);
  }

  const filter = {
    ownerId,
    "waterEntries._id": id,
  };

  const result = await waterServices.updatePortion(filter, updateData);

  if (!result) {
    throw HttpError(404, `Water entry not found`);
  }

  res.json(result);
};

const deletePortion = async (req, res) => {
  const id = ObjectId(req.params.id);

  const { _id: ownerId } = req.user;

  const filter = {
    ownerId,
    "waterEntries._id": ObjectId(id),
  };

  const result = await waterServices.deletePortion(filter);

  if (!result) {
    throw HttpError(404, `Water entry not found`);
  }

  res.json({
    message: "Portion of water was deleted successfully",
  });
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

const getMonthTrackers = async (req, res) => {
  const { year, month } = req.params;
  const ownerId = req.user._id;

  if (!year || !month) {
    return res.status(400).json({ message: "Year and month are required." });
  }

  const monthIndex = parseInt(month, 10) - 1;
  const stats = await waterServices.getMonthlyReport(
    ownerId,
    parseInt(year, 10),
    monthIndex
  );

  res.json(stats);
};

export default {
  createPortion: ctrlWrapper(createPortion),
  updatePortion: ctrlWrapper(updatePortion),
  deletePortion: ctrlWrapper(deletePortion),
  getTodayTracker: ctrlWrapper(getTodayTracker),
  getMonthTrackers: ctrlWrapper(getMonthTrackers),
};
