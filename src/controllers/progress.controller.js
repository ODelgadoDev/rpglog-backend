const UserProfile = require("../models/UserProfile");
const UserStat = require("../models/UserStat");
const XpLog = require("../models/XpLog");
const { ensureUserProgress } = require("../services/userProgress.service");
const {
  calculateGlobalProgress,
  calculateStatProgress
} = require("../utils/progression");

function serializeProfile(profile) {
  return {
    level: profile.level,
    xpTotal: profile.xpTotal,
    xpCurrentLevel: profile.xpCurrentLevel,
    xpNextLevel: profile.xpNextLevel,
    coins: profile.coins,
    coinsEarnedTotal: profile.coinsEarnedTotal,
    coinsSpentTotal: profile.coinsSpentTotal,
    streakCurrent: profile.streakCurrent,
    streakMax: profile.streakMax,
    ownedTitleIds: profile.ownedTitleIds || [],
    equippedTitleId: profile.equippedTitleId,
    customSlots: profile.customSlots
  };
}

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
      profile: serializeProfile(profile),
      stats: statsWithProgress
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function spendCoins(req, res) {
  try {
    const userId = req.user.userId;
    const amount = Number(req.body?.amount || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        ok: false,
        message: "amount debe ser un número mayor a 0"
      });
    }

    await ensureUserProgress(userId);

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ ok: false, message: "Perfil no encontrado" });
    }

    if (profile.coins < amount) {
      return res.status(400).json({
        ok: false,
        message: "Monedas insuficientes",
        profile: serializeProfile(profile)
      });
    }

    profile.coins -= amount;
    profile.coinsSpentTotal += amount;
    await profile.save();

    return res.json({
      ok: true,
      message: "Monedas gastadas correctamente",
      profile: serializeProfile(profile)
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function addGameReward(req, res) {
  try {
    const userId = req.user.userId;
    const xp = Number(req.body?.xp || 0);
    const coins = Number(req.body?.coins || 0);
    const statKey = req.body?.statKey || null;

    await ensureUserProgress(userId);

    const profile = await UserProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ ok: false, message: "Perfil no encontrado" });
    }

    const safeXp = Number.isFinite(xp) ? xp : 0;
    const safeCoins = Number.isFinite(coins) ? coins : 0;

    profile.xpTotal += safeXp;
    profile.coins += safeCoins;
    profile.coinsEarnedTotal += safeCoins;

    const globalProgress = calculateGlobalProgress(profile.xpTotal);
    profile.level = globalProgress.level;
    profile.xpCurrentLevel = globalProgress.xpCurrentLevel;
    profile.xpNextLevel = globalProgress.xpNextLevel;

    await profile.save();

    if (safeXp > 0) {
      await XpLog.create({
        userId,
        amount: safeXp,
        amountFinal: safeXp,
        sourceType: "mini_game",
        sourceId: null,
        statKey: statKey || null,
        bonusFlags: { coinsGranted: safeCoins }
      });
    }

    if (statKey) {
      const stat = await UserStat.findOne({ userId, statKey });
      if (stat) {
        stat.xp += safeXp;
        const statProgress = calculateStatProgress(stat.xp);
        stat.level = statProgress.level;
        stat.xpMax = statProgress.xpMax;
        await stat.save();
      }
    }

    const stats = await UserStat.find({ userId }).sort({ statKey: 1 });

    return res.json({
      ok: true,
      message: "Recompensa del minijuego aplicada",
      profile: serializeProfile(profile),
      stats
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function buyTitle(req, res) {
  try {
    const userId = req.user.userId;
    const { titleId, price } = req.body || {};
    const safePrice = Number(price || 0);

    if (!titleId) {
      return res.status(400).json({ ok: false, message: "titleId es requerido" });
    }

    await ensureUserProgress(userId);
    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ ok: false, message: "Perfil no encontrado" });
    }

    const owned = new Set(profile.ownedTitleIds || []);
    if (owned.has(titleId)) {
      return res.json({
        ok: true,
        message: "El título ya estaba comprado",
        profile: serializeProfile(profile)
      });
    }

    if (safePrice > 0) {
      if (profile.coins < safePrice) {
        return res.status(400).json({
          ok: false,
          message: "Monedas insuficientes",
          profile: serializeProfile(profile)
        });
      }
      profile.coins -= safePrice;
      profile.coinsSpentTotal += safePrice;
    }

    owned.add(titleId);
    profile.ownedTitleIds = [...owned];
    await profile.save();

    return res.json({
      ok: true,
      message: "Título comprado correctamente",
      profile: serializeProfile(profile)
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function equipTitle(req, res) {
  try {
    const userId = req.user.userId;
    const { titleId } = req.body || {};

    if (!titleId) {
      return res.status(400).json({ ok: false, message: "titleId es requerido" });
    }

    await ensureUserProgress(userId);
    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ ok: false, message: "Perfil no encontrado" });
    }

    const owned = new Set(profile.ownedTitleIds || []);
    if (!owned.has(titleId)) {
      return res.status(400).json({
        ok: false,
        message: "Ese título no está comprado"
      });
    }

    profile.equippedTitleId = titleId;
    await profile.save();

    return res.json({
      ok: true,
      message: "Título equipado correctamente",
      profile: serializeProfile(profile)
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function buyCustomSlot(req, res) {
  try {
    const userId = req.user.userId;
    const { slotIdx, price } = req.body || {};
    const safePrice = Number(price || 0);
    const nextSlots = Number(slotIdx) + 1;

    if (!Number.isInteger(Number(slotIdx)) || Number(slotIdx) < 0 || Number(slotIdx) > 2) {
      return res.status(400).json({ ok: false, message: "slotIdx inválido" });
    }

    await ensureUserProgress(userId);
    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ ok: false, message: "Perfil no encontrado" });
    }

    if (profile.customSlots >= nextSlots + 1) {
      return res.json({
        ok: true,
        message: "Ese slot ya estaba desbloqueado",
        profile: serializeProfile(profile)
      });
    }

    if (profile.coins < safePrice) {
      return res.status(400).json({
        ok: false,
        message: "Monedas insuficientes",
        profile: serializeProfile(profile)
      });
    }

    profile.coins -= safePrice;
    profile.coinsSpentTotal += safePrice;
    profile.customSlots = Math.max(profile.customSlots, nextSlots + 1);
    await profile.save();

    return res.json({
      ok: true,
      message: "Espacio custom desbloqueado",
      profile: serializeProfile(profile)
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}

module.exports = {
  getProgressSummary,
  spendCoins,
  addGameReward,
  buyTitle,
  equipTitle,
  buyCustomSlot
};