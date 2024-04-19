import { Schema, model } from "mongoose";

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
      default: Date.now,
    },
    dailyWaterNorm: {
      type: Number,
      default: 2000,
      min: [0, "Daily water norm cannot be negative"],
      max: [15000, "Daily water norm cannot exceed 15000ml"],
    },
    waterEntries: [
      {
        time: {
          type: Date,
          required: true,
          default: Date.now,
        },
        waterVolume: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Water portion cannot be negative"],
          max: [5000, "Maximum of 5000 ml per portion"],
        },
      },
    ],
    percentageOfDailyGoal: {
      type: Number,
      default: 0,
    },
    numberOfEntries: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false, timestamps: true }
);

const Water = model("tracker", waterTrackerSchema);

export default Water;
