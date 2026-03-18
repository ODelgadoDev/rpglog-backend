const Quest = require("../models/Quest");
const { DAILY_QUESTS } = require("../utils/dailyQuests");
const { applyQuestReward } = require("../services/rewardEngine.service");

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

async function listQuests(req, res) {
  try {
    const userId = req.user.userId;

    const quests = await Quest.find({
      userId,
      deleted: false
    }).sort({ createdAt: -1 });

    return res.json({ ok: true, quests });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

async function listCustomQuests(req, res) {
  try {
    const userId = req.user.userId;

    const quests = await Quest.find({
      userId,
      type: "custom",
      deleted: false
    }).sort({ createdAt: -1 });

    return res.json({ ok: true, quests });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

async function createQuest(req, res) {
  try {
    const userId = req.user.userId;

    const body = req.body || {};
    const {
      title,
      description = "",
      type = "daily",
      xpReward = 10,
      globalXpReward,
      coinReward = 0,
      statRewards = []
    } = body;

    if (!title) {
      return res.status(400).json({
        ok: false,
        message: "title es requerido"
      });
    }

    const quest = await Quest.create({
      userId,
      title,
      description,
      type,
      xpReward,
      globalXpReward: typeof globalXpReward === "number" ? globalXpReward : xpReward,
      coinReward,
      statRewards
    });

    return res.status(201).json({ ok: true, quest });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

async function createCustomQuest(req, res) {
  try {
    const userId = req.user.userId;

    const body = req.body || {};
    const {
      title,
      description = "",
      xpReward = 10,
      globalXpReward,
      coinReward = 0,
      statRewards = []
    } = body;

    if (!title) {
      return res.status(400).json({
        ok: false,
        message: "title es requerido"
      });
    }

    const quest = await Quest.create({
      userId,
      title,
      description,
      type: "custom",
      xpReward,
      globalXpReward: typeof globalXpReward === "number" ? globalXpReward : xpReward,
      coinReward,
      statRewards
    });

    return res.status(201).json({
      ok: true,
      message: "Custom quest creada",
      quest
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

async function updateCustomQuest(req, res) {
  try {
    const userId = req.user.userId;
    const questId = req.params.id;

    const quest = await Quest.findOne({
      _id: questId,
      userId,
      type: "custom",
      deleted: false
    });

    if (!quest) {
      return res.status(404).json({
        ok: false,
        message: "Custom quest no encontrada"
      });
    }

    const body = req.body || {};
    const {
      title,
      description,
      xpReward,
      globalXpReward,
      coinReward,
      statRewards
    } = body;

    if (typeof title !== "undefined") quest.title = title;
    if (typeof description !== "undefined") quest.description = description;
    if (typeof xpReward !== "undefined") quest.xpReward = xpReward;
    if (typeof globalXpReward !== "undefined") quest.globalXpReward = globalXpReward;
    if (typeof coinReward !== "undefined") quest.coinReward = coinReward;
    if (typeof statRewards !== "undefined") quest.statRewards = statRewards;

    await quest.save();

    return res.json({
      ok: true,
      message: "Custom quest actualizada",
      quest
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

async function completeQuest(req, res) {
  try {
    const userId = req.user.userId;
    const questId = req.params.id;

    const quest = await Quest.findOne({
      _id: questId,
      userId,
      deleted: false
    });

    if (!quest) {
      return res.status(404).json({
        ok: false,
        message: "Quest no encontrada"
      });
    }

    if (quest.completed) {
      return res.json({
        ok: true,
        message: "Ya estaba completada",
        quest
      });
    }

    quest.completed = true;
    quest.completedAt = new Date();
    await quest.save();

    const progress = await applyQuestReward(userId, quest);

    return res.json({
      ok: true,
      message: "Quest completada y recompensa aplicada",
      quest,
      profile: progress.profile,
      stats: progress.stats
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

async function deleteQuest(req, res) {
  try {
    const userId = req.user.userId;
    const questId = req.params.id;

    const quest = await Quest.findOne({
      _id: questId,
      userId,
      deleted: false
    });

    if (!quest) {
      return res.status(404).json({
        ok: false,
        message: "Quest no encontrada"
      });
    }

    quest.deleted = true;
    await quest.save();

    return res.json({
      ok: true,
      message: "Quest eliminada",
      questId
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

async function deleteCustomQuest(req, res) {
  try {
    const userId = req.user.userId;
    const questId = req.params.id;

    const quest = await Quest.findOne({
      _id: questId,
      userId,
      type: "custom",
      deleted: false
    });

    if (!quest) {
      return res.status(404).json({
        ok: false,
        message: "Custom quest no encontrada"
      });
    }

    quest.deleted = true;
    await quest.save();

    return res.json({
      ok: true,
      message: "Custom quest eliminada",
      questId
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

async function seedDailyQuests(req, res) {
  try {
    const userId = req.user.userId;
    const todayKey = getTodayKey();

    const existingToday = await Quest.find({
      userId,
      type: "daily",
      dayKey: todayKey,
      deleted: false
    });

    if (existingToday.length > 0) {
      return res.json({
        ok: true,
        message: "Las quests diarias de hoy ya existen",
        quests: existingToday
      });
    }

    const questsToInsert = DAILY_QUESTS.map((quest) => ({
      userId,
      title: quest.title,
      description: quest.description,
      type: quest.type,
      xpReward: quest.xpReward ?? quest.globalXpReward ?? 10,
      globalXpReward: quest.globalXpReward ?? quest.xpReward ?? 10,
      coinReward: quest.coinReward ?? 0,
      statRewards: quest.statRewards ?? [],
      dayKey: todayKey
    }));

    const createdQuests = await Quest.insertMany(questsToInsert);

    return res.status(201).json({
      ok: true,
      message: "Quests diarias generadas",
      quests: createdQuests
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message
    });
  }
}

module.exports = {
  listQuests,
  listCustomQuests,
  createQuest,
  createCustomQuest,
  updateCustomQuest,
  completeQuest,
  deleteQuest,
  deleteCustomQuest,
  seedDailyQuests
};