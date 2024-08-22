// Import Joi for validation
import Joi from "joi";

/**
 * 
 * @param {*} data 
 * @description Validation for signing up for a newsletter
 */
const validateSignupNewsletter = (data) => {
	const schema = Joi.object({
		email: Joi.string().min(2).max(255).required(),
	});

	return schema.validate(data);
}

export {
	validateSignupNewsletter
}