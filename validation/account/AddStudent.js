// Import Joi for validation
import Joi from "joi";

/**
 * 
 * @param {*} data 
 * @description Validation for adding student
 */
const validateAddStudent = (data) => {
	const schema = Joi.object({
		first_name: Joi
			.string()
			.min(2)
			.max(255)
			.required(),
		last_name: Joi
			.string()
			.min(2)
			.max(255)
			.required(),
		email: Joi
			.string()
			.min(2)
			.max(255)
			.required(),
		phone: Joi
			.string()
			.min(9)
			.max(14)
			.pattern(/^[0-9]+$/)
			.required(),
		current_class: Joi
			.string()
			.min(2)
			.max(255)
			.required(),
	});

	return schema.validate(data);
}

export {
	validateAddStudent
}