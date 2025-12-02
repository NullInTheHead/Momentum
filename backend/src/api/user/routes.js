const express = require("express");
const {
  getSummary,
  getHistory,
  getStats,
  getPerformance,
  deleteAccount,
  getProfile,
  updateProfile,
  uploadPicture,
} = require("./controllers");
const { upload } = require("./middlewares");
const router = express.Router();
router.get("/summary", getSummary);
router.get("/history", getHistory);
router.get("/history/daily", getHistory);
router.get("/stats", getStats);
router.get("/stats/monthly", getStats);
router.get("/stats/habit-performance", getPerformance);
router.get("/performance", getPerformance);
router.delete("/account", deleteAccount);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile/upload-picture", upload.single("profilePicture"), uploadPicture);
module.exports = router;
