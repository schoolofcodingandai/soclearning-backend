// Import Joi for validation
import Joi from "joi";

/**
 * 
 * @param {*} data 
 * @description Validation for adding new lesson to an existing course
 */
const validateAddLesson = (data) => {
	const schema = Joi.object({
		title: Joi
			.string()
			.min(2)
			.max(255)
			.required(),
		description: Joi
			.string()
			.min(2)
			.max(1024),
		course_id: Joi
			.string()
			.min(2)
			.max(255)
			.required(),
	});

	return schema.validate(data);
}

export {
	validateAddLesson
}