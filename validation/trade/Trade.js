// Import Joi for validation
const Joi = require("joi");

// Constants
const { TRADE_TYPE, TRADE_COINS } = require("../../constants/trade");

/**
 * 
 * @param {*} data 
 * @description Validation for adding a trade
 */
const addTradeValidation = (data) => {
    const schema = Joi.object({
        trade_type: Joi
            .string()
            .valid(...Object.values(TRADE_TYPE))
            .required(),
        trading_coin: Joi
            .string()
            .valid(...Object.values(TRADE_COINS))
            .required(),
        price: Joi
            .number()
            .required(),
        total_quantity: Joi
            .number()
            .required(),
        minimum_buy_amount: Joi
            .number()
            .required(),
        maximum_buy_amount: Joi
            .number()
            .required(),
        payment_id: Joi
            .string()
            .min(24)
            .required()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for getting buy/sell trades
 */
const getTradesValidation = (data) => {
    const schema = Joi.object({
        trade_type: Joi
            .string()
            .valid(...Object.values(TRADE_TYPE))
            .required(),
        page: Joi
            .number()
    });

    return schema.validate(data);
}

module.exports = {
    addTradeValidation,
    getTradesValidation
}