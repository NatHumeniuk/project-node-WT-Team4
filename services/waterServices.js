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
      $setOnInsert: { date: userDay, dailyWaterNorm: dailyWaterNormOwner },
    },
    { upsert: true, new: true }
  );

  const totalWater = tracker.waterEntries.reduce(
    (sum, entry) => sum + entry.waterVolume,
    0
  );

  const newPercentageOfDailyGoal = Math.round(
    (totalWater / tracker.dailyWaterNorm) * 100
  );

  await Water.updateOne(
    { _id: tracker._id },
    {
      $set: {
        percentage: newPercentageOfDailyGoal,
        numberOfEntries: tracker.waterEntries.length,
      },
    }
  );

  return Water.findById(tracker._id);
};

export const updatePortion = async (filter, updateData) => {
  const updatedDocument = await Water.findOneAndUpdate(
    filter,
    { $set: updateData },
    {
      new: true,
    }
  );
  return updatedDocument;
};

export const todayTracker = (filter = {}) =>
  Water.find(filter, "-createdAt -updatedAt -numberOfEntries  -owner -date");

export const getMonthlyReport = async (ownerId, year, month) => {
  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 1));

  const trackers = await Water.find({
    owner: ownerId,
    date: { $gte: startDate, $lt: endDate },
  }).sort({ date: 1 });

  return trackers.map((tracker) => {
    return {
      date: `${tracker.date.getUTCDate()}, ${tracker.date.toLocaleString(
        "default",
        { month: "long" }
      )}`,
      dailyWaterNorm: `${tracker.dailyWaterNorm / 1000} L`,
      percentage: tracker.percentage,
      numberOfEntries: tracker.waterEntries.length,
    };
  });
};
