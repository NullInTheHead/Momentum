const Joi = require("joi");
const { ValidationError } = require("../utils/errors");
function validate(schema) {
    return (req, res, next) => {
        const validationOptions = {
            abortEarly: false, 
            allowUnknown: true, 
            stripUnknown: true, 
        };
        const toValidate = {};
        if (schema.body) {
            toValidate.body = req.body;
        }
        if (schema.query) {
            toValidate.query = req.query;
        }
        if (schema.params) {
            toValidate.params = req.params;
        }
        const schemaToValidate = Joi.object(schema);
        const { error, value } = schemaToValidate.validate(toValidate, validationOptions);
        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(", ");
            throw new ValidationError(errorMessage);
        }
        if (value.body) req.body = value.body;
        if (value.query) req.query = value.query;
        if (value.params) req.params = value.params;
        next();
    };
}
const schemas = {
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    username: Joi.string().min(3).max(30).required(),
    name: Joi.string().min(1).max(100),
    id: Joi.number().integer().positive().required(),
    idOptional: Joi.number().integer().positive(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    habitStatus: Joi.string().valid("active", "archived"),
    friendshipStatus: Joi.string().valid("PENDING", "ACCEPTED"),
    boolean: Joi.boolean(),
    date: Joi.date().iso(),
    string: Joi.string(),
};
module.exports = {
    validate,
    schemas,
};
