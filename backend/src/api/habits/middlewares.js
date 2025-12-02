function validateCreateHabit(req, res, next) {
  const { name, frequency } = req.body;
  if (!name || !frequency) {
    return res.status(400).json({ error: "Name and frequency are required" });
  }
  next();
}
module.exports = { validateCreateHabit };
