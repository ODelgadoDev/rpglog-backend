const mongoose = require("mongoose");

const statRewardSchema = new mongoose.Schema(
  {
    statKey: {
      type: String,
      enum: ["str", "res", "agi", "int", "cre", "com"],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const questSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    type: { type: String, default: "daily", trim: true },

    // viejo, lo dejamos por compatibilidad
    xpReward: { type: Number, default: 10, min: 0 },

    // nuevo sistema
    globalXpReward: { type: Number, default: 10, min: 0 },
    coinReward: { type: Number, default: 0, min: 0 },
    statRewards: {
      type: [statRewardSchema],
      default: []
    },

    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },

    deleted: { type: Boolean, default: false },

    dayKey: { type: String, default: null },

    deviceId: { type: String, default: null },
    clientId: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quest", questSchema);