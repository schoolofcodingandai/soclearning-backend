// Import Joi for validation
import Joi from "joi";
import joiObjectid from "joi-objectid";
Joi.objectId = joiObjectid(Joi);

/**
 * 
 * @param {*} data 
 * @description Validation for updating course category
 */
const validateUpdateCourseCategory = (data) => {
	const schema = Joi.object({
		category_id: Joi.objectId().required(),
		title: Joi
			.string()
			.min(2)
			.max(255)
			.required(),
	});

	return schema.validate(data);
}

export {
	validateUpdateCourseCategory
}