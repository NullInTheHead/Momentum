const express = require("express");
const { create, getAll, remove } = require("./controllers");
const { validateCreateLog } = require("./middlewares");
const router = express.Router();
router.post("/:habitId/logs", validateCreateLog, create);
router.get("/:habitId/logs", getAll);
router.delete("/:habitId/logs/:logId", remove);
module.exports = router;
