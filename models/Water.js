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
  },
  { versionKey: false, timestamps: true }
);

const Water = model("water", waterTrackerSchema);

export default Water;
