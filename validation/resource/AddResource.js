// Import Joi for validation
import Joi from "joi";
import { RESOURCE_TYPES } from "../../constants/resource.js";

/**
 * 
 * @param {*} data 
 * @description Validation for adding resource
 */
const validateAddResource = (data) => {
	const schema = Joi.object({
		title: Joi.string().required().min(2).max(255),
		subtitle: Joi.string().required().min(2).max(255),
		tags: Joi.array().items(Joi.string().required().min(2).max(255)).required(),
		content: Joi.string().required(),
		type: Joi.string().valid(...RESOURCE_TYPES).required()
	});

	return schema.validate(data);
}

export {
	validateAddResource
}