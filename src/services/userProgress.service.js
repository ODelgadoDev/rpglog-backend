const UserProfile = require("../models/UserProfile");
const UserStat = require("../models/UserStat");

const DEFAULT_STAT_KEYS = ["str", "res", "agi", "int", "cre", "com"];

async function ensureUserProgress(userId) {
  let profile = await UserProfile.findOne({ userId });

  if (!profile) {
    profile = await UserProfile.create({ userId });
  }

  const existingStats = await UserStat.find({ userId });
  const existingKeys = new Set(existingStats.map((s) => s.statKey));

  const missing = DEFAULT_STAT_KEYS.filter((key) => !existingKeys.has(key));

  if (missing.length > 0) {
    await UserStat.insertMany(
      missing.map((statKey) => ({
        userId,
        statKey
      }))
    );
  }

  return {
    profile,
    stats: await UserStat.find({ userId }).sort({ statKey: 1 })
  };
}

module.exports = { ensureUserProgress };