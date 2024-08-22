// Import Joi for validation
const Joi = require("joi");

/**
 * 
 * @param {*} data 
 * @description Validation for adding the FAQ
 */
const addFAQValidation = (data) => {
    const schema = Joi.object({
        title: Joi
            .string()
            .required(),
        content: Joi
            .string(),
        is_link: Joi
            .boolean(),
        link: Joi
            .string()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for editing a faq
 * by faq_id for admin
 */
const editFAQValidation = (data) => {
    const schema = Joi.object({
        faq_id: Joi
            .string()
            .min(24)
            .required(),
        title: Joi
            .string(),
        content: Joi
            .string(),
        is_link: Joi
            .boolean(),
        link: Joi
            .string()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for deleting a FAQ
 * by faq_id for admin
 */
const deleteFAQValidation = (data) => {
    const schema = Joi.object({
        faq_id: Joi
            .string()
            .min(24)
            .required()
    });

    return schema.validate(data);
}

module.exports = {
    addFAQValidation,
    editFAQValidation,
    deleteFAQValidation
}