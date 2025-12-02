const express = require("express");
const { signup, login } = require("./controllers");
const { validateSignup, validateLogin } = require("./middlewares");
const router = express.Router();
router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
module.exports = router;
