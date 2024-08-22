// Import Joi for validation
import Joi from "joi";

/**
 * 
 * @param {*} data 
 * @description Validation for adding school
 */
const validateAddSchool = (data) => {
	const schema = Joi.object({
		teacher_admin: Joi
			.object({
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
			})
			.required(),
		name: Joi
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
		email: Joi
			.string()
			.min(2)
			.max(255)
			.required(),
	});

	return schema.validate(data);
}

export {
	validateAddSchool
}