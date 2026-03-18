const mongoose = require("mongoose");

const ALLOWED_STATS = ["str", "res", "agi", "int", "cre", "com"];

const userStatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    statKey: {
      type: String,
      required: true,
      enum: ALLOWED_STATS
    },
    level: { type: Number, default: 1, min: 1 },
    xp: { type: Number, default: 0, min: 0 },
    xpMax: { type: Number, default: 200, min: 1 }
  },
  { timestamps: true }
);

userStatSchema.index({ userId: 1, statKey: 1 }, { unique: true });

module.exports = mongoose.model("UserStat", userStatSchema);