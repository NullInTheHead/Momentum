function validateSearchUsers(req, res, next) {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  next();
}
function validateSendRequest(req, res, next) {
  const { friendUsername } = req.body;
  if (!friendUsername) {
    return res.status(400).json({ error: "Friend username is required" });
  }
  next();
}
module.exports = { validateSearchUsers, validateSendRequest };
