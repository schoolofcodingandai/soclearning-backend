// Import Joi for validation
const Joi = require("joi");

// Constants
const { TRADE_COINS } = require("../../constants/trade");
const { TRANSACTION_TYPES } = require("../../constants/transaction");

/**
 * 
 * @param {*} data 
 * @description Validation for creating a transaction
 */
const createTransactionValidation = (data) => {
    const schema = Joi.object({
        transaction_type: Joi
            .number()
            .valid(...Object.values(TRANSACTION_TYPES))
            .required(),
        trading_coin: Joi
            .string()
            .valid(...Object.values(TRADE_COINS))
            .required(),
        quantity: Joi
            .number()
            .required(),
        user_id: Joi
            .string()
            .min(24)
            .required(),
        txn_id: Joi
            .string()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for getting transactions by transaction
 * type & trading coin
 */
const getTransactionsValidation = (data) => {
    const schema = Joi.object({
        transaction_type: Joi
            .number()
            .valid(...Object.values(TRANSACTION_TYPES))
            .required(),
        trading_coin: Joi
            .string()
            .valid(...Object.values(TRADE_COINS))
            .required()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for getting all transactions
 * by trading coin
 */
const getAllTransactionsValidation = (data) => {
    const schema = Joi.object({
        trading_coin: Joi
            .string()
            .valid(...Object.values(TRADE_COINS))
            .required()
    });

    return schema.validate(data);
}

module.exports = {
    createTransactionValidation,
    getTransactionsValidation,
    getAllTransactionsValidation
}