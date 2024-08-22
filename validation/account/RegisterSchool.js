// Import Joi for validation
import Joi from "joi";

/**
 * 
 * @param {*} data 
 * @description Validation for registering school
 */
const validateRegisterSchool = (data) => {
	const schema = Joi.object({
		commissioner_name: Joi
			.string()
			.min(2)
			.max(255)
			.required(),
		school_name: Joi
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
		message: Joi
			.string()
			.min(2)
			.max(1024)
			.required()
	});

	return schema.validate(data);
}

export {
	validateRegisterSchool
}