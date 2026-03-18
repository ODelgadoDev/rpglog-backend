const router = require("express").Router();
const { authRequired } = require("../middleware/auth.middleware");
const { pushSync, pullSync } = require("../controllers/sync.controller");

router.use(authRequired);

router.post("/push", pushSync);
router.get("/pull", pullSync);

module.exports = router;