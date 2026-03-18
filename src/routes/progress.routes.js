const router = require("express").Router();
const { authRequired } = require("../middleware/auth.middleware");
const { getProgressSummary } = require("../controllers/progress.controller");

router.use(authRequired);

router.get("/summary", getProgressSummary);

module.exports = router;