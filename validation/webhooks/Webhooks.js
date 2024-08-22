// Import Joi for validation
const Joi = require("joi");

// Constants
const { TRADE_COINS } = require("../../constants/trade");
const { WEBHOOK_TYPES } = require("../../constants/webhook");

/**
 * 
 * @param {*} data 
 * @description Validation for deposit completed webhook
 */
const depositCompletedWebhookValidation = (data) => {
    const schema = Joi.array().items(
        Joi.object({
            data: Joi
                .object({
                    type: Joi
                        .string()
                        .valid(...Object.values(WEBHOOK_TYPES))
                        .required(),
                    symbol: Joi
                        .string()
                        .valid(...Object.keys(TRADE_COINS))
                        .required(),
                    amount: Joi
                        .number()
                        .required(),
                    toAddress: Joi
                        .string()
                        .required(),
                    fromAddress: Joi
                        .string()
                        .required()
                })
                .required()
                .unknown()
        }).unknown()
    );

    return schema.validate(data);
}

module.exports = {
    depositCompletedWebhookValidation
}