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

const geoPointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: []
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

    xpReward: { type: Number, default: 10, min: 0 },

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
    clientId: { type: String, default: null },

    // configuración de evidencia
    photoEvidenceEnabled: { type: Boolean, default: false },
    locationEvidenceEnabled: { type: Boolean, default: false },

    photoBonusXp: { type: Number, default: 0, min: 0 },
    photoBonusCoins: { type: Number, default: 0, min: 0 },
    photoBonusStatRewards: {
      type: [statRewardSchema],
      default: []
    },

    locationBonusXp: { type: Number, default: 0, min: 0 },
    locationBonusCoins: { type: Number, default: 0, min: 0 },
    locationBonusStatRewards: {
      type: [statRewardSchema],
      default: []
    },

    // estado de evidencias
    photoEvidenceSubmitted: { type: Boolean, default: false },
    photoEvidenceSubmittedAt: { type: Date, default: null },
    photoBonusApplied: { type: Boolean, default: false },

    locationEvidenceSubmitted: { type: Boolean, default: false },
    locationEvidenceSubmittedAt: { type: Date, default: null },
    locationBonusApplied: { type: Boolean, default: false },

    location: {
      type: geoPointSchema,
      default: null
    },
    locationAccuracy: { type: Number, default: null },
    locationCapturedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

questSchema.index({ userId: 1, completedAt: -1 });
questSchema.index({ userId: 1, title: 1 });
questSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Quest", questSchema);