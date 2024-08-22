// Import Joi for validation
const Joi = require("joi");

/**
 * 
 * @param {*} data 
 * @description Validation for fetching a profile details
 */
const fetchProfileDetailsValidation = (data) => {
    const schema = Joi.object({
        client_id: Joi
            .string()
            .min(6)
            .max(12)
            .required()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for getting trades for
 * another user
 */
const fetchProfileTradesValidation = (data) => {
    const schema = Joi.object({
        client_id: Joi
            .string()
            .min(6)
            .max(12)
            .required(),
        page: Joi
            .number()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for getting statistics for
 * another user
 */
const fetchStatisticsValidation = (data) => {
    const schema = Joi.object({
        client_id: Joi
            .string()
            .min(6)
            .max(12)
            .required()
    });

    return schema.validate(data);
}

module.exports = {
    fetchProfileDetailsValidation,
    fetchProfileTradesValidation,
    fetchStatisticsValidation
}