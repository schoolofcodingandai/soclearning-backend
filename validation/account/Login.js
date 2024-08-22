// Import Joi for validation
import Joi from "joi";

// Extend & Import Joi Password for password validation
import { joiPasswordExtendCore } from "joi-password";
const JoiPassword = Joi.extend(joiPasswordExtendCore);

/**
 * 
 * @param {*} data 
 * @description Validation for login
 */
const validateLogin = (data) => {
	const schema = Joi.object({
		email: Joi
			.string()
			.min(2)
			.max(255)
			.required(),
		password: JoiPassword
			.string()
			.min(6)
			.max(1024)
			.required()
	});

	return schema.validate(data);
}

export {
	validateLogin
}