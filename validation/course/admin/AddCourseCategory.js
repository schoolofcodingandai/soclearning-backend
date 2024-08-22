// Import Joi for validation
import Joi from "joi";

/**
 * 
 * @param {*} data 
 * @description Validation for adding new course category
 */
const validateAddCourseCategory = (data) => {
	const schema = Joi.object({
		title: Joi
			.string()
			.min(2)
			.max(255)
			.required(),
	});

	return schema.validate(data);
}

export {
	validateAddCourseCategory
}