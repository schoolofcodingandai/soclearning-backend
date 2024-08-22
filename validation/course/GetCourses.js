// Import Joi for validation
import Joi from "joi";
import joiObjectid from "joi-objectid";
Joi.objectId = joiObjectid(Joi);

/**
 * 
 * @param {*} data 
 * @description Validation for getting courses
 */
const validateGetCourses = (data) => {
	const schema = Joi.object({
		category_id: Joi.objectId().allow(''),
		search: Joi.string().allow(''),
	});

	return schema.validate(data);
}

export {
	validateGetCourses
}