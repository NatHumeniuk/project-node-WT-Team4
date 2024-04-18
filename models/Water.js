import { Schema, model } from "mongoose";

const waterEntrySchema = new Schema({
  waterVolume: {
    type: Number,
    required: true,
    default: 2000,
    min: [0, "Water portion cannot be negative"],
    max: [5000, "Maximum of 5000 ml per portion"],
  },
  time: {
    type: Date,
    required: true,
  },
});

const dailySummarySchema = new Schema({
  date: {
    type: Date,
    default: () => {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      return currentDate;
    },
  },
  dailyWaterNorm: {
    type: Number,
    default: 2000,
    min: [0, "Daily water norm cannot be negative"],
    max: [15000, "Daily water norm cannot exceed 15000ml"],
  },
  percentageOfDailyGoal: {
    type: Number,
    default: 0,
  },
  numberOfEntries: {
    type: Number,
    default: 0,
  },
});

const waterTrackerSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    waterEntries: [waterEntrySchema],
    dailySummaries: [dailySummarySchema],
  },
  { versionKey: false, timestamps: true }
);

waterTrackerSchema.pre("save", function (next) {
  const tracker = this;

  const todaySummary =
    tracker.dailySummaries[tracker.dailySummaries.length - 1];

  if (
    todaySummary &&
    todaySummary.date.toDateString() === new Date().toDateString()
  ) {
    const totalVolumeToday = tracker.waterEntries
      .filter(
        (entry) => entry.time.toDateString() === new Date().toDateString()
      )
      .reduce((acc, entry) => acc + entry.waterVolume, 0);
    todaySummary.totalVolumeToday = totalVolumeToday;
    todaySummary.numberOfEntries = tracker.waterEntries.length;
    todaySummary.percentageOfDailyGoal =
      (totalVolumeToday / todaySummary.dailyWaterNorm) * 100;
  }

  next();
});

const Water = model("water", waterTrackerSchema);

export default Water;
