const express = require("express");
const {
  share,
  unshare,
  getAll,
  create,
  getProgress,
  remove,
} = require("./controllers");
const { validateShareHabit, validateCreateBuddy } = require("./middlewares");
const router = express.Router();
router.post("/share", validateShareHabit, share);
router.delete("/unshare/:habitId/:partnerId", unshare);
router.get("/", getAll);
router.post("/create-buddy", validateCreateBuddy, create);
router.get("/buddy-progress/:habitId", getProgress);
router.delete("/remove-buddy/:sharedHabitId", remove);
module.exports = router;
