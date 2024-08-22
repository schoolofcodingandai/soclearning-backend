// Import Joi for validation
const Joi = require("joi");

// Extend & Import Joi Password for password validation
const { joiPasswordExtendCore } = require("joi-password");

/**
 * 
 * @param {*} data 
 * @description Validation for adding the notice
 */
const addNoticeValidation = (data) => {
    const schema = Joi.object({
        title: Joi
            .string()
            .required(),
        content: Joi
            .object()
            .required(),
        new_notice: Joi
            .boolean()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for searching users
 */
const searchUserValidation = (data) => {
    const schema = Joi.object({
        keyword: Joi
            .string()
            .required(),
        page: Joi
            .number()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for editing a notice
 * by notice_id for admin
 */
const editNoticeValidation = (data) => {
    const schema = Joi.object({
        notice_id: Joi
            .string()
            .min(24)
            .required(),
        title: Joi
            .string(),
        content: Joi
            .object(),
        new_notice: Joi
            .boolean()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for deleting a notice
 * by notice_id for admin
 */
const deleteNoticeValidation = (data) => {
    const schema = Joi.object({
        notice_id: Joi
            .string()
            .min(24)
            .required()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for adding/removing partner seller
 */
const partnerSellerValidation = (data) => {
    const schema = Joi.object({
        id: Joi
            .string()
            .min(24)
            .required(),
        partner: Joi
            .boolean()
            .required()
    });

    return schema.validate(data);
}

module.exports = {
    addNoticeValidation,
    searchUserValidation,
    editNoticeValidation,
    deleteNoticeValidation,
    partnerSellerValidation
}