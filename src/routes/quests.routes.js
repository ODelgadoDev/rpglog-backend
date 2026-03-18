const router = require("express").Router();
const { authRequired } = require("../middleware/auth.middleware");
const {
  listQuests,
  listCustomQuests,
  createQuest,
  createCustomQuest,
  updateCustomQuest,
  completeQuest,
  deleteQuest,
  deleteCustomQuest,
  seedDailyQuests
} = require("../controllers/quests.controller");

router.use(authRequired);

router.get("/", listQuests);
router.post("/", createQuest);

router.post("/seed-daily", seedDailyQuests);

router.get("/custom", listCustomQuests);
router.post("/custom", createCustomQuest);
router.patch("/custom/:id", updateCustomQuest);
router.delete("/custom/:id", deleteCustomQuest);

router.patch("/:id/complete", completeQuest);
router.delete("/:id", deleteQuest);

module.exports = router;