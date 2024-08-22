// Import Joi for validation
import Joi from "joi";
import joiObjectid from "joi-objectid";
Joi.objectId = joiObjectid(Joi);
import { RESOURCE_TYPES } from "../../constants/resource.js";

/**
 * 
 * @param {*} data 
 * @description Validation for adding resource
 */
const validateUpdateResource = (data) => {
	const schema = Joi.object({
		resource_id: Joi.objectId().required(),
		title: Joi.string().min(2).max(255),
		subtitle: Joi.string().min(2).max(255),
		tags: Joi.array().items(Joi.string().required().min(2).max(255)),
		content: Joi.string(),
		type: Joi.string().valid(...RESOURCE_TYPES)
	});

	return schema.validate(data);
}

export {
	validateUpdateResource
}