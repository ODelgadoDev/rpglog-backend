const Quest = require("../models/Quest");

async function pushSync(req, res) {
  try {
    const userId = req.user.userId;
    const { quests = [] } = req.body;

    const results = [];

    for (const item of quests) {
      const {
        clientId = null,
        title,
        description = "",
        type = "daily",
        xpReward = 10,
        completed = false,
        completedAt = null,
        deleted = false,
        dayKey = null,
        deviceId = null,
        updatedAt = null
      } = item;

      if (!title && !deleted) {
        results.push({
          clientId,
          ok: false,
          message: "title es requerido"
        });
        continue;
      }

      let existing = null;

      if (clientId) {
        existing = await Quest.findOne({ userId, clientId });
      }

      if (!existing) {
        const created = await Quest.create({
          userId,
          clientId,
          title,
          description,
          type,
          xpReward,
          completed,
          completedAt,
          deleted,
          dayKey,
          deviceId
        });

        results.push({
          clientId,
          ok: true,
          action: "created",
          serverId: created._id
        });

        continue;
      }

      existing.title = title ?? existing.title;
      existing.description = description ?? existing.description;
      existing.type = type ?? existing.type;
      existing.xpReward = xpReward ?? existing.xpReward;
      existing.completed = completed ?? existing.completed;
      existing.completedAt = completedAt ?? existing.completedAt;
      existing.deleted = deleted ?? existing.deleted;
      existing.dayKey = dayKey ?? existing.dayKey;
      existing.deviceId = deviceId ?? existing.deviceId;

      await existing.save();

      results.push({
        clientId,
        ok: true,
        action: "updated",
        serverId: existing._id
      });
    }

    return res.json({
      ok: true,
      message: "Sync push completado",
      results,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
}

async function pullSync(req, res) {
  try {
    const userId = req.user.userId;
    const since = req.query.since;

    let filter = { userId };

    if (since) {
      filter.updatedAt = { $gt: new Date(since) };
    }

    const quests = await Quest.find(filter).sort({ updatedAt: 1 });

    return res.json({
      ok: true,
      quests,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message
    });
  }
}

module.exports = { pushSync, pullSync };