// Import Joi for validation
import Joi from "joi";

/**
 * 
 * @param {*} data 
 * @description Validation for getting all newsletter signups
 */
const validateGetAllNewsletterSignups = (data) => {
	const schema = Joi.object({
		search: Joi.string().allow(''),
	});

	return schema.validate(data);
}

export {
	validateGetAllNewsletterSignups
}