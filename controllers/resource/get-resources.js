// Express async handler
import asyncHandler from 'express-async-handler';
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from '../../constants/status.js';
import Resource from '../../models/resource/Resource.js';
import { validateGetResources } from '../../validation/resource/GetResources.js';
import { RESOURCE_TYPES } from '../../constants/resource.js';

/**
 * @description Get all resources for main website
 * @route POST /api/resource/
 * @access Public
 */
export default asyncHandler(async (req, res) => {

	const { error } = validateGetResources(req.body);
	if (error) {
		return res.status(HTTP_STATUS_CODES.BAD_REQUEST)
			.send({
				status: HTTP_STATUS_MESSAGES.ERROR,
				message: error.details[0].message
			});
	}

	// Get all resources
	const { type, search } = req.body;

	let query = { type: type || [...RESOURCE_TYPES] };
	if (search) {
		query.title = { $regex: search, $options: 'i' };
	}

	const resources = await Resource.find(query, 'title subtitle tags type thumbnail created_at').sort({ created_at: -1 }).exec();

	return res.status(HTTP_STATUS_CODES.OK)
		.send({
			status: HTTP_STATUS_MESSAGES.SUCCESS,
			resources
		});
});