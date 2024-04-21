import { Schema, model } from "mongoose";

import { handleSaveError, setUpdateSettings } from "./hooks.js";

const waterTrackerSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    dailyWaterNorm: {
      type: Number,
      default: 2000,
      min: [1, "Daily water norm cannot be less than 1"],
      max: [15000, "Daily water norm cannot exceed 15000ml"],
    },
    waterEntries: [
      {
        time: {
          type: Date,
          required: true,
        },
        waterVolume: {
          type: Number,
          required: true,

          min: [0, "Water portion cannot be negative"],
          max: [5000, "Maximum of 5000 ml per portion"],
        },
      },
    ],
    percentageOfDailyGoal: {
      type: Number,
    },
    numberOfEntries: {
      type: Number,
    },
  },
  { versionKey: false, timestamps: true }
);

waterTrackerSchema.post("save", handleSaveError);

waterTrackerSchema.pre("findOneAndUpdate", setUpdateSettings);

waterTrackerSchema.post("findOneAndUpdate", handleSaveError);

const Water = model("tracker", waterTrackerSchema);

export default Water;
