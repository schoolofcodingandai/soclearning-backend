// Import Joi for validation
const Joi = require("joi");

// Constants
const { ASSESSMENT_TYPE } = require("../../constants/review");

/**
 * @param {*} data 
 * @description Validation for creating a review
 */
const createReviewValidation = (data) => {
    const schema = Joi.object({
        order_id: Joi
            .string()
            .min(24)
            .required(),
        comments: Joi
            .string()
            .required(),
        assessment_type: Joi
            .number()
            .valid(...Object.values(ASSESSMENT_TYPE))
            .required(),
        review: Joi
            .array()
            .items(
                Joi
                    .number()
                    .required()
            )
            .required()
    });

    return schema.validate(data);
}

/**
 * @param {*} data 
 * @description Validation for fetching reviews
 */
const fetchReviewsValidation = (data) => {
    const schema = Joi.object({
        seller_id: Joi
            .string()
            .min(24)
            .required(),
        page: Joi
            .number()
    });

    return schema.validate(data);
}


module.exports = {
    createReviewValidation,
    fetchReviewsValidation
}