// Import Joi for validation
const Joi = require("joi");

// Extend & Import Joi Password for password validation
const { joiPasswordExtendCore } = require("joi-password");
const JoiPassword = Joi.extend(joiPasswordExtendCore);

/**
 * 
 * @param {*} data 
 * @description Validation for registering a payment method
 */
const registerPaymentMethod = (data) => {
    const schema = Joi.object({
        bank_name: Joi
            .string()
            .min(2)
            .max(1024)
            .required(),
        account_number: Joi
            .string()
            .min(11)
            .max(16)
            .required(),
        account_holder_name: Joi
            .string()
            .min(2)
            .max(255)
            .required()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for deleting a payment method
 */
const deletePaymentMethod = (data) => {
    const schema = Joi.object({
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
 * @description Validation for changing account password for logged
 * in user
 */
const changePasswordValidation = (data) => {
    const schema = Joi.object({
        current_password: JoiPassword
            .string()
            .min(6)
            .max(1024)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .noWhiteSpaces()
            .required(),
        new_password: JoiPassword
            .string()
            .min(6)
            .max(1024)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .noWhiteSpaces()
            .required(),
        confirm_new_password: JoiPassword
            .string()
            .min(6)
            .max(1024)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .noWhiteSpaces()
            .required()
    });

    return schema.validate(data);
}

module.exports = {
    registerPaymentMethod,
    deletePaymentMethod,
    changePasswordValidation
}