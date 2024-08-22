// Import Joi for validation
const Joi = require("joi");

/**
 * @param {*} data 
 * @description Validation for creating an order
 */
const createOrderValidation = (data) => {
    const schema = Joi.object({
        trade_id: Joi
            .string()
            .min(24)
            .required(),
        seller_id: Joi
            .string()
            .min(24)
            .required(),
        quantity: Joi
            .number()
            .required(),
        depositor_name: Joi
            .string()
            .required(),
        deposited_amount: Joi
            .number()
            .required()
    });

    return schema.validate(data);
}

/**
 * @param {*} data 
 * @description Validation for approving an order
 */
const approveOrderValidation = (data) => {
    const schema = Joi.object({
        order_id: Joi
            .string()
            .min(24)
            .required()
    });

    return schema.validate(data);
}

module.exports = {
    createOrderValidation,
    approveOrderValidation
}