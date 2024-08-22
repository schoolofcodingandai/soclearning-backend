// Import Joi for validation
import Joi from "joi";
import joiObjectid from "joi-objectid";
Joi.objectId = joiObjectid(Joi);

/**
 * 
 * @param {*} data 
 * @description Validation for getting course details
 */
const validateGetCourseDetails = (data) => {
	const schema = Joi.object({
		id: Joi.objectId()
	});

	return schema.validate(data);
}

export {
	validateGetCourseDetails
}