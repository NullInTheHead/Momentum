const Joi = require("joi");
const { validate, schemas } = require("../../middleware/validation");
const validateSignup = validate({
  body: Joi.object({
    email: schemas.email,
    password: schemas.password,
    username: schemas.username,
    name: schemas.name.optional(),
  }),
});
const validateLogin = validate({
  body: Joi.object({
    email: schemas.email,
    password: schemas.password,
  }),
});
module.exports = { validateSignup, validateLogin };
