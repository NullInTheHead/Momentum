const { createLog, getLogs, deleteLog } = require("./services");
const { HTTP_STATUS } = require("../../config/constants");
async function create(req, res) {
  const { habitId } = req.params;
  const userId = req.userId;
  const { log_date } = req.body;
  const log = await createLog({ habitId, userId, log_date });
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Log created successfully",
    log,
  });
}
async function getAll(req, res) {
  const { habitId } = req.params;
  const userId = req.userId;
  const { page = "1", limit = "20" } = req.query;
  const result = await getLogs({ habitId, userId, page, limit });
  res.json({
    success: true,
    ...result,
  });
}
async function remove(req, res) {
  const { habitId, logId } = req.params;
  const userId = req.userId;
  await deleteLog({ habitId, logId, userId });
  res.json({
    success: true,
    message: "Log deleted successfully",
  });
}
module.exports = { create, getAll, remove };
