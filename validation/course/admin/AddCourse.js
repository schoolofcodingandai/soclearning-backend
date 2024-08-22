// Import Joi for validation
import Joi from "joi";
import joiObjectid from "joi-objectid";
Joi.objectId = joiObjectid(Joi);

/**
 * 
 * @param {*} data 
 * @description Validation for adding new course
 */
const validateAddCourse = (data) => {
	const schema = Joi.object({
		title: Joi
			.string()
			.min(2)
			.max(255)
			.required(),
		description: Joi
			.string()
			.min(2)
			.max(1024)
			.required(),
		category_id: Joi
			.objectId()
			.required()
			.messages({
				'string.empty': 'Category cannot be empty',
				'any.required': 'Category is required',
			})
		// tags: Joi
		// 	.array()
		// 	.items(Joi.string().min(2).max(255).required())
		// 	.required(),
	});

	return schema.validate(data);
}

export {
	validateAddCourse
}