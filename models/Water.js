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
      default: Date.now,
    },

    amount: {
      type: Number,
      required: true,
    },
    dailyWaterNorm: {
      type: Number,
      default: 2000,
      min: [0, "Daily water norm cannot be negative"],
      max: [15000, "Daily water norm cannot exceed 15000ml"],
    },
  },
  { versionKey: false, timestamps: true }
);

const Water = model("water", waterTrackerSchema);

export default Water;
