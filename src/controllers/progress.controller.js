const UserProfile = require("../models/UserProfile");
const UserStat = require("../models/UserStat");
const { ensureUserProgress } = require("../services/userProgress.service");

async function getProgressSummary(req, res) {
  try {
    const userId = req.user.userId;

    await ensureUserProgress(userId);

    const profile = await UserProfile.findOne({ userId });
    const stats = await UserStat.find({ userId }).sort({ statKey: 1 });

    const statsWithProgress = stats.map((stat) => ({
      _id: stat._id,
      statKey: stat.statKey,
      level: stat.level,
      xp: stat.xp,
      xpMax: stat.xpMax,
      progressPercent:
        stat.xpMax > 0 ? Math.round((stat.xp / stat.xpMax) * 100) : 0
    }));

    return res.json({
      ok: true,
      profile: {
        level: profile.level,
        xpTotal: profile.xpTotal,
        xpCurrentLevel: profile.xpCurrentLevel,
        xpNextLevel: profile.xpNextLevel,
        coins: profile.coins,
        streakCurrent: profile.streakCurrent,
        streakMax: profile.streakMax
      },
      stats: statsWithProgress
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

module.exports = {
  getProgressSummary
};