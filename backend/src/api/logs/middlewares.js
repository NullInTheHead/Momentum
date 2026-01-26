const Joi = require("joi");
const { validate, schemas } = require("../../middleware/validation");

const validateCreateLog = validate({
  params: Joi.object({
    habitId: schemas.id,
  }),
  body: Joi.object({
    log_date: schemas.date.optional(),
  }),
});

const validateGetLogs = validate({
  params: Joi.object({
    habitId: schemas.id,
  }),
  query: Joi.object({
    page: schemas.page,
    limit: schemas.limit,
  }),
});

const validateDeleteLog = validate({
  params: Joi.object({
    habitId: schemas.id,
    logId: schemas.id,
  }),
});

module.exports = { validateCreateLog, validateGetLogs, validateDeleteLog };
