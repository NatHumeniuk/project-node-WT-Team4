import Water from "../models/Water.js";

export const addPortionWater = async (
  ownerId,
  waterData,
  dailyWaterNormOwner
) => {
  const userDay = new Date(waterData.date);
  userDay.setUTCHours(0, 0, 0, 0);

  const tomorrow = new Date(userDay);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const tracker = await Water.findOneAndUpdate(
    {
      owner: ownerId,
      date: { $gte: userDay, $lt: tomorrow },
    },
    {
      $push: { waterEntries: waterData },
      $setOnInsert: { date: userDay },
    },
    { new: true, upsert: true, returnOriginal: false }
  );

  if (
    !tracker.dailyWaterNorm ||
    tracker.dailyWaterNorm !== dailyWaterNormOwner
  ) {
    await Water.updateOne(
      { _id: tracker._id },
      { dailyWaterNorm: dailyWaterNormOwner }
    );
  }
  const totalWater = tracker.waterEntries.reduce(
    (sum, entry) => sum + entry.waterVolume,
    0
  );

  const newPercentageOfDailyGoal = (totalWater / tracker.dailyWaterNorm) * 100;

  await Water.updateOne(
    { _id: tracker._id },
    {
      $set: {
        percentageOfDailyGoal: newPercentageOfDailyGoal,
        numberOfEntries: tracker.waterEntries.length,
      },
    }
  );

  return Water.findById(tracker._id);
};
