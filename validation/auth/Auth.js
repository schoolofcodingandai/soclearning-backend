// Import Joi for validation
const Joi = require("joi");

// Extend & Import Joi Password for password validation
const { joiPasswordExtendCore } = require("joi-password");
const JoiPassword = Joi.extend(joiPasswordExtendCore);

/**
 * 
 * @param {*} data 
 * @description Validation for registering an user
 */
const registerValidation = (data) => {
    const schema = Joi.object({
        email: Joi
            .string()
            .email()
            .required(),
        password: JoiPassword
            .string()
            .min(6)
            .max(1024)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .noWhiteSpaces()
            .required(),
        phone: Joi
            .string()
            .min(7)
            .max(15)
            .required(),
        client_id: Joi
            .string()
            .min(6)
            .max(12)
            .required(),
        referrer: Joi
            .string()
            .min(6)
            .max(12)
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for logging an user
 */
const loginValidation = (data) => {
    const schema = Joi.object({
        client_id: Joi
            .string()
            .min(6)
            .max(12)
            .required(),
        password: JoiPassword
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

/**
 * 
 * @param {*} data 
 * @description Validation for forgot password
 */
const forgotPasswordValidation = (data) => {
    const schema = Joi.object({
        client_id: Joi
            .string()
            .min(6)
            .max(12)
            .required(),
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for reset password
 */
const resetPasswordValidation = (data) => {
    const schema = Joi.object({
        client_id: Joi
            .string()
            .min(6)
            .max(12)
            .required(),
        password: JoiPassword
            .string()
            .min(6)
            .max(1024)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .noWhiteSpaces()
            .required(),
        otp: Joi
            .string()
            .min(6)
            .max(6)
            .required()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for sending verification email
 */
const sendEmailVerificationValidation = (data) => {
    const schema = Joi.object({
        email: Joi
            .string()
            .email()
            .required(),
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for verifying email
 */
const verifyEmailValidation = (data) => {
    const schema = Joi.object({
        email: Joi
            .string()
            .email()
            .required(),
        link_id: Joi
            .string()
            .min(21)
            .required()
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for sending sms verification
 */
const sendPhoneVerificationValidation = (data) => {
    const schema = Joi.object({
        phone: Joi
            .string()
            .min(7)
            .max(15)
            .required(),
    });

    return schema.validate(data);
}

/**
 * 
 * @param {*} data 
 * @description Validation for verifying phone
 */
const verifyPhoneValidation = (data) => {
    const schema = Joi.object({
        phone: Joi
            .string()
            .min(7)
            .max(15)
            .required(),
        otp: Joi
            .number()
            .min(6)
            .required()
    });

    return schema.validate(data);
}

module.exports = {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    sendEmailVerificationValidation,
    verifyEmailValidation,
    sendPhoneVerificationValidation,
    verifyPhoneValidation
}