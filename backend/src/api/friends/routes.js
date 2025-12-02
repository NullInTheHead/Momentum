const express = require("express");
const {
  search,
  sendRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
  removeFriend,
  getAll,
  getOverlapping,
} = require("./controllers");
const { validateSearchUsers, validateSendRequest } = require("./middlewares");
const router = express.Router();
router.post("/search", validateSearchUsers, search);
router.post("/request", validateSendRequest, sendRequest);
router.get("/requests", getRequests);
router.post("/accept/:friendshipId", acceptRequest);
router.delete("/reject/:friendshipId", rejectRequest);
router.delete("/:friendId", removeFriend);
router.get("/", getAll);
router.get("/pod", getAll); 
router.get("/:friendId/overlapping-habits", getOverlapping);
module.exports = router;
