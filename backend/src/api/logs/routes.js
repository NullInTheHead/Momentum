const express = require("express");
const { create, getAll, remove } = require("./controllers");
const { validateCreateLog, validateGetLogs, validateDeleteLog } = require("./middlewares");
const router = express.Router();
router.post("/:habitId/logs", validateCreateLog, create);
router.get("/:habitId/logs", validateGetLogs, getAll);
router.delete("/:habitId/logs/:logId", validateDeleteLog, remove);
module.exports = router;
