const router = require("express").Router();
const { authRequired } = require("../middleware/auth.middleware");
const {
  getProgressSummary,
  spendCoins,
  addGameReward,
  buyTitle,
  equipTitle,
  buyCustomSlot
} = require("../controllers/progress.controller");

router.use(authRequired);

router.get("/summary", getProgressSummary);
router.post("/spend-coins", spendCoins);
router.post("/game-reward", addGameReward);
router.post("/buy-title", buyTitle);
router.post("/equip-title", equipTitle);
router.post("/buy-custom-slot", buyCustomSlot);

module.exports = router;