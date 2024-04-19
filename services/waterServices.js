import Water from "../models/Water.js";

export const addPortionWater = async (ownerId, waterData) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tracker = await Water.findOneAndUpdate(
    {
      owner: ownerId,
      date: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
    },
    { $push: { waterEntries: waterData } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (!tracker) {
    throw new Error("Tracker not found");
  }

  const totalWater =
    tracker.waterEntries.reduce((sum, entry) => sum + entry.waterVolume, 0) +
    waterData.waterVolume;

  const newPercentageOfDailyGoal = (totalWater / tracker.dailyWaterNorm) * 100;

  await Water.findByIdAndUpdate(tracker._id, {
    $set: {
      percentageOfDailyGoal: newPercentageOfDailyGoal,
      numberOfEntries: tracker.waterEntries.length + 1,
    },
  });

  return Water.findById(tracker._id);
};
