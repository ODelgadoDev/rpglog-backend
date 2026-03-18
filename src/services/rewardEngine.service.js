const UserProfile = require("../models/UserProfile");
const UserStat = require("../models/UserStat");
const XpLog = require("../models/XpLog");
const { ensureUserProgress } = require("./userProgress.service");
const {
  calculateGlobalProgress,
  calculateStatProgress
} = require("../utils/progression");

async function applyQuestReward(userId, quest) {
  await ensureUserProgress(userId);

  const profile = await UserProfile.findOne({ userId });
  if (!profile) {
    throw new Error("UserProfile no encontrado");
  }

  // Compatibilidad: si no trae globalXpReward usamos xpReward
  const globalXpToAdd =
    typeof quest.globalXpReward === "number"
      ? quest.globalXpReward
      : quest.xpReward || 0;

  const coinsToAdd = quest.coinReward || 0;
  const statRewards = Array.isArray(quest.statRewards) ? quest.statRewards : [];

  // 1) XP global
  profile.xpTotal += globalXpToAdd;
  profile.coins += coinsToAdd;
  profile.coinsEarnedTotal += coinsToAdd;

  const globalProgress = calculateGlobalProgress(profile.xpTotal);
  profile.level = globalProgress.level;
  profile.xpCurrentLevel = globalProgress.xpCurrentLevel;
  profile.xpNextLevel = globalProgress.xpNextLevel;

  await profile.save();

  // 2) Log global
  if (globalXpToAdd > 0) {
    await XpLog.create({
      userId,
      amount: globalXpToAdd,
      amountFinal: globalXpToAdd,
      sourceType: mapQuestTypeToSourceType(quest.type),
      sourceId: quest._id.toString(),
      statKey: null,
      bonusFlags: {
        coinsGranted: coinsToAdd
      }
    });
  }

  // 3) XP por stat
  for (const reward of statRewards) {
    const stat = await UserStat.findOne({
      userId,
      statKey: reward.statKey
    });

    if (!stat) continue;

    stat.xp += reward.amount;

    const statProgress = calculateStatProgress(stat.xp);
    stat.level = statProgress.level;
    stat.xpMax = statProgress.xpMax;

    await stat.save();

    await XpLog.create({
      userId,
      amount: reward.amount,
      amountFinal: reward.amount,
      sourceType: mapQuestTypeToSourceType(quest.type),
      sourceId: quest._id.toString(),
      statKey: reward.statKey,
      bonusFlags: {}
    });
  }

  const updatedStats = await UserStat.find({ userId }).sort({ statKey: 1 });

  return {
    profile,
    stats: updatedStats
  };
}

function mapQuestTypeToSourceType(type) {
  switch (type) {
    case "weekly":
      return "weekly_mission";
    case "special":
      return "special_mission";
    case "custom":
      return "custom_mission";
    case "daily":
    default:
      return "daily_mission";
  }
}

module.exports = {
  applyQuestReward
};