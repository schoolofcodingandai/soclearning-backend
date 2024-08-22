// Import Joi for validation
import Joi from "joi";
import { RESOURCE_TYPES } from "../../constants/resource.js";

/**
 * 
 * @param {*} data 
 * @description Validation for getting resources
 */
const validateGetResources = (data) => {
	const schema = Joi.object({
		type: Joi.string().valid(...RESOURCE_TYPES).allow(''),
		search: Joi.string().allow(''),
	});

	return schema.validate(data);
}

export {
	validateGetResources
}