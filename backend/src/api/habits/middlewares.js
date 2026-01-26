const Joi = require("joi");
const { validate, schemas } = require("../../middleware/validation");

const validateCreateHabit = validate({
  body: Joi.object({
    name: schemas.name.required(),
    frequency: Joi.string().required(),
    daily_deadline: Joi.string().optional(),
    goal: Joi.string().optional(),
    is_shared: Joi.boolean().optional(),
  }),
});

const validateUpdateHabit = validate({
  params: Joi.object({
    id: schemas.id,
  }),
  body: Joi.object({
    name: schemas.name.optional(),
    frequency: Joi.string().optional(),
    daily_deadline: Joi.string().allow(null).optional(),
    goal: Joi.string().allow(null).optional(),
    is_shared: Joi.boolean().optional(),
  }),
});

module.exports = { validateCreateHabit, validateUpdateHabit };
