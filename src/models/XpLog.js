const mongoose = require("mongoose");

const xpLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    amount: { type: Number, required: true, min: 0 },
    amountFinal: { type: Number, required: true, min: 0 },

    sourceType: {
      type: String,
      required: true,
      enum: [
        "daily_mission",
        "weekly_mission",
        "special_mission",
        "custom_mission",
        "minigame",
        "achievement",
        "quest_photo_evidence",
        "quest_location_evidence"
      ]
    },

    sourceId: { type: String, default: null },
    statKey: {
      type: String,
      enum: ["str", "res", "agi", "int", "cre", "com", null],
      default: null
    },

    bonusFlags: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    earnedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

xpLogSchema.index({ userId: 1, earnedAt: -1 });
xpLogSchema.index({ userId: 1, sourceType: 1 });

module.exports = mongoose.model("XpLog", xpLogSchema);